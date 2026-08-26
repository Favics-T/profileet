const cuid = require('cuid')
const { pool } = require('../config/db')
const { paginate } = require('../middleware/paginate')

const UNAVAILABLE_DAY_STATUSES = ['busy', 'off']
const COLOURS = ['#be185d', '#0ea5e9', '#7c3aed', '#16a34a', '#d97706', '#0891b2', '#dc2626', '#059669']


const STATUS_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}


const TRANSITION_ROLE = {
  'pending->accepted': 'artisan',
  'pending->cancelled': 'any',
  'accepted->in_progress': 'artisan',
  'accepted->cancelled': 'any',
  'in_progress->completed': 'artisan',
  'in_progress->cancelled': 'artisan',
}

const toInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

const randomColour = () => COLOURS[Math.floor(Math.random() * COLOURS.length)]

const bookingOwnerColumn = (role) => (role === 'artisan' ? '"designerId"' : '"clientId"')


function checkStatusChange(currentStatus, nextStatus, role) {
  const allowedNext = STATUS_TRANSITIONS[currentStatus] ?? []
  if (!allowedNext.includes(nextStatus)) {
    return {
      code: 400,
      error: `Cannot move from ${currentStatus} to ${nextStatus}. Valid transitions from ${currentStatus}: ${allowedNext.length ? allowedNext.join(', ') : 'none'}`,
    }
  }

  const requiredRole = TRANSITION_ROLE[`${currentStatus}->${nextStatus}`]
  if (requiredRole && requiredRole !== 'any' && role !== requiredRole) {
    return { code: 403, error: `Only the ${requiredRole} can change status from ${currentStatus} to ${nextStatus}` }
  }

  return null
}

async function listBookings(req, res) {
  try {
    const { skip, take, page, limit } = paginate(req)
    const ownerColumn = bookingOwnerColumn(req.role)
    const { status } = req.query

    if (status !== undefined && !STATUS_TRANSITIONS[status]) {
      return res.status(400).json({ error: `status must be one of: ${Object.keys(STATUS_TRANSITIONS).join(', ')}` })
    }

    const conditions = [`${ownerColumn} = $1`]
    const values = [req.userId]
    if (status) {
      conditions.push(`status = $${values.length + 1}`)
      values.push(status)
    }
    const whereClause = conditions.join(' AND ')

    const [{ rows: bookings }, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM "Booking"
         WHERE ${whereClause}
         ORDER BY "createdAt" DESC
         OFFSET $${values.length + 1} LIMIT $${values.length + 2}`,
        [...values, skip, take]
      ),
      pool.query(
        `SELECT COUNT(*) FROM "Booking" WHERE ${whereClause}`,
        values
      ),
    ])

    const total = Number(countResult.rows[0].count)
    res.json({ data: bookings, page, limit, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
}

async function getBooking(req, res) {
  try {
    const ownerColumn = bookingOwnerColumn(req.role)
    const { rows } = await pool.query(
      `SELECT * FROM "Booking" WHERE id = $1 AND ${ownerColumn} = $2 LIMIT 1`,
      [req.params.id, req.userId]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch booking' })
  }
}

async function createBooking(req, res) {
  const {
    artisanId, client, service, occasion, deliveryDate, price, depositAmount,
    clientPhone, quantity, urgent, designNotes, fabrics, colors,
    inspirationRef, measurements, consultation,
  } = req.body

  if (!artisanId || !client || !service || !occasion || !deliveryDate) {
    return res.status(400).json({ error: 'artisanId, client, service, occasion, and deliveryDate are required' })
  }

  const bookingPrice = price != null ? Number(price) : 0
  const bookingDepositAmount = depositAmount != null ? Number(depositAmount) : 0

  // 
  const dbClient = await pool.connect()
  try {
    const { rows: artisanRows } = await dbClient.query(
      `SELECT id FROM "User" WHERE id = $1 AND role = 'artisan' LIMIT 1`,
      [artisanId]
    )
    if (artisanRows.length === 0) return res.status(404).json({ error: 'Artisan not found' })

    await dbClient.query('BEGIN')

    
    const { rows: availabilityRows } = await dbClient.query(
      `SELECT status FROM "Availability" WHERE "designerId" = $1 AND date = $2 FOR UPDATE`,
      [artisanId, deliveryDate]
    )
    if (UNAVAILABLE_DAY_STATUSES.includes(availabilityRows[0]?.status)) {
      await dbClient.query('ROLLBACK')
      return res.status(409).json({ error: 'Artisan is not available on this date' })
    }

    const { rows } = await dbClient.query(
      `INSERT INTO "Booking" (
         id, "designerId", "clientId", client, initials, "clientColor", "clientPhone",
         service, occasion, "deliveryDate", quantity, urgent, status,
         "receivedAt", price, "depositPaid", "depositAmount", "designNotes",
         fabrics, colors, "inspirationRef", measurements, consultation, "updatedAt"
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12, $13,
         $14, $15, $16, $17, $18,
         $19, $20, $21, $22, $23, NOW()
       )
       RETURNING *`,
      [
        cuid(),
        artisanId,
        req.userId,
        client,
        toInitials(client),
        randomColour(),
        clientPhone ?? '',
        service,
        occasion,
        deliveryDate,
        quantity ?? 1,
        urgent ?? false,
        'pending',
        new Date(),
        bookingPrice,
        false,
        bookingDepositAmount,
        designNotes ?? '',
        fabrics ?? [],
        colors ?? [],
        inspirationRef ?? '',
        JSON.stringify(measurements ?? {}),
        JSON.stringify(consultation ?? { requested: false, status: 'none' }),
      ]
    )

    await dbClient.query('COMMIT')
    res.status(201).json(rows[0])
  } catch (err) {
    await dbClient.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Failed to create booking' })
  } finally {
    dbClient.release()
  }
}

async function updateBooking(req, res) {
  const { id } = req.params

  try {
    const ownerColumn = bookingOwnerColumn(req.role)
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM "Booking" WHERE id = $1 AND ${ownerColumn} = $2 LIMIT 1`,
      [id, req.userId]
    )
    const existing = existingRows[0]
    if (!existing) return res.status(404).json({ error: 'Booking not found' })

    const {
      status, consultation, designNotes, deliveryDate, price,
      depositAmount, urgent, quantity, fabrics, colors, inspirationRef, measurements,
    } = req.body

    if (status !== undefined) {
      const statusError = checkStatusChange(existing.status, status, req.role)
      if (statusError) return res.status(statusError.code).json({ error: statusError.error })
    }

    if ((price !== undefined || depositAmount !== undefined) && req.role !== 'artisan') {
      return res.status(403).json({ error: 'Only the artisan can change price or depositAmount' })
    }

    if (deliveryDate !== undefined) {
      const { rows: availabilityRows } = await pool.query(
        `SELECT status FROM "Availability" WHERE "designerId" = $1 AND date = $2 LIMIT 1`,
        [existing.designerId, deliveryDate]
      )
      if (UNAVAILABLE_DAY_STATUSES.includes(availabilityRows[0]?.status)) {
        return res.status(409).json({ error: 'Artisan is not available on this date' })
      }
    }

    const setClauses = []
    const values = []
    let i = 1

    const add = (column, value) => {
      setClauses.push(`${column} = $${i}`)
      values.push(value)
      i++
    }

    if (status !== undefined) add('status', status)
   
    if (consultation !== undefined) {
      const merged = { ...(existing.consultation ?? {}), ...consultation }
      add('consultation', JSON.stringify(merged))
    }
    if (designNotes !== undefined) add('"designNotes"', designNotes)
    if (deliveryDate !== undefined) add('"deliveryDate"', deliveryDate)
    if (price !== undefined) add('price', Number(price))
    if (depositAmount !== undefined) add('"depositAmount"', Number(depositAmount))
    if (urgent !== undefined) add('urgent', urgent)
    if (quantity !== undefined) add('quantity', Number(quantity))
    if (fabrics !== undefined) add('fabrics', fabrics)
    if (colors !== undefined) add('colors', colors)
    if (inspirationRef !== undefined) add('"inspirationRef"', inspirationRef)
    if (measurements !== undefined) {
      const merged = { ...(existing.measurements ?? {}), ...measurements }
      add('measurements', JSON.stringify(merged))
    }

    if (setClauses.length === 0) return res.json(existing)

    values.push(id)
    const { rows } = await pool.query(
      `UPDATE "Booking" SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update booking' })
  }
}

async function replaceBooking(req, res) {
  const { id } = req.params
  const {
    artisanId, client, service, occasion, deliveryDate, price, depositAmount,
    clientPhone, quantity, urgent, designNotes, fabrics, colors,
    inspirationRef, measurements, consultation,
  } = req.body

  if (!artisanId || !client || !service || !occasion || !deliveryDate || price == null || depositAmount == null) {
    return res.status(400).json({ error: 'artisanId, client, service, occasion, deliveryDate, price, and depositAmount are required for a full update' })
  }

  try {
    const ownerColumn = bookingOwnerColumn(req.role)
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM "Booking" WHERE id = $1 AND ${ownerColumn} = $2 LIMIT 1`,
      [id, req.userId]
    )
    const existing = existingRows[0]
    if (!existing) return res.status(404).json({ error: 'Booking not found' })

    if (req.role !== 'artisan' && (Number(price) !== existing.price || Number(depositAmount) !== existing.depositAmount)) {
      return res.status(403).json({ error: 'Only the artisan can change price or depositAmount' })
    }

    const { rows: artisanRows } = await pool.query(
      `SELECT id FROM "User" WHERE id = $1 AND role = 'artisan' LIMIT 1`,
      [artisanId]
    )
    if (artisanRows.length === 0) return res.status(404).json({ error: 'Artisan not found' })

    const { rows: availabilityRows } = await pool.query(
      `SELECT status FROM "Availability" WHERE "designerId" = $1 AND date = $2 LIMIT 1`,
      [artisanId, deliveryDate]
    )
    if (UNAVAILABLE_DAY_STATUSES.includes(availabilityRows[0]?.status)) {
      return res.status(409).json({ error: 'Artisan is not available on this date' })
    }

    const { rows } = await pool.query(
      `UPDATE "Booking" SET
         "designerId" = $1,
         "clientId" = $2,
         client = $3,
         initials = $4,
         "clientColor" = $5,
         "clientPhone" = $6,
         service = $7,
         occasion = $8,
         "deliveryDate" = $9,
         quantity = $10,
         urgent = $11,
         price = $12,
         "depositPaid" = $13,
         "depositAmount" = $14,
         "designNotes" = $15,
         fabrics = $16,
         colors = $17,
         "inspirationRef" = $18,
         measurements = $19,
         consultation = $20,
         "receivedAt" = $21
       WHERE id = $22
       RETURNING *`,
      [
        artisanId,
        existing.clientId,
        client,
        toInitials(client),
        existing.clientColor ?? randomColour(),
        clientPhone ?? '',
        service,
        occasion,
        deliveryDate,
        quantity ?? 1,
        urgent ?? false,
        Number(price),
        existing.depositPaid,
        Number(depositAmount),
        designNotes ?? '',
        fabrics ?? [],
        colors ?? [],
        inspirationRef ?? '',
        JSON.stringify(measurements ?? {}),
        JSON.stringify(consultation ?? { requested: false, status: 'none' }),
        existing.receivedAt ?? new Date(),
        id,
      ]
    )
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to replace booking' })
  }
}

async function deleteBooking(req, res) {
  try {
    const ownerColumn = bookingOwnerColumn(req.role)
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM "Booking" WHERE id = $1 AND ${ownerColumn} = $2 LIMIT 1`,
      [req.params.id, req.userId]
    )
    const existing = existingRows[0]
    if (!existing) return res.status(404).json({ error: 'Booking not found' })

    const statusError = checkStatusChange(existing.status, 'cancelled', req.role)
    if (statusError) return res.status(statusError.code).json({ error: statusError.error })

    const { rows } = await pool.query(
      `UPDATE "Booking" SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [existing.id]
    )
    res.json({ message: `Booking ${rows[0].id} cancelled`, booking: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to cancel booking' })
  }
}

module.exports = { listBookings, getBooking, createBooking, updateBooking, replaceBooking, deleteBooking }
