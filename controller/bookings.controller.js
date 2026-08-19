const cuid = require('cuid')
const { pool } = require('../config/db')
const { paginate } = require('../middleware/paginate')

const VALID_STATUSES = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']
const COLOURS = ['#be185d', '#0ea5e9', '#7c3aed', '#16a34a', '#d97706', '#0891b2', '#dc2626', '#059669']

const toInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

const randomColour = () => COLOURS[Math.floor(Math.random() * COLOURS.length)]


async function listBookings(req, res) {
  try {
    const { skip, take, page, limit } = paginate(req)

    const [{ rows: bookings }, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM "Booking"
         WHERE "designerId" = $1
         ORDER BY "createdAt" DESC
         OFFSET $2 LIMIT $3`,
        [req.userId, skip, take]
      ),
      pool.query(
        `SELECT COUNT(*) FROM "Booking" WHERE "designerId" = $1`,
        [req.userId]
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
    const { rows } = await pool.query(
      `SELECT * FROM "Booking" WHERE id = $1 AND "designerId" = $2 LIMIT 1`,
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
    client, service, occasion, deliveryDate, price, depositAmount,
    clientPhone, quantity, urgent, designNotes, fabrics, colors,
    inspirationRef, measurements, consultation,
  } = req.body

  if (!client || !service || !occasion || !deliveryDate || price == null || depositAmount == null) {
    return res.status(400).json({ error: 'client, service, occasion, deliveryDate, price, and depositAmount are required' })
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO "Booking" (
         id, "designerId", client, initials, "clientColor", "clientPhone",
         service, occasion, "deliveryDate", quantity, urgent, status,
         "receivedAt", price, "depositPaid", "depositAmount", "designNotes",
         fabrics, colors, "inspirationRef", measurements, consultation
       )
       VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11, $12,
         $13, $14, $15, $16, $17,
         $18, $19, $20, $21, $22
       )
       RETURNING *`,
      [
        cuid(), req.userId, client, toInitials(client), randomColour(), clientPhone ?? '',
        service, occasion, deliveryDate, quantity ?? 1, urgent ?? false, 'pending',
        new Date(), Number(price), false, Number(depositAmount), designNotes ?? '',
        fabrics ?? [], colors ?? [], inspirationRef ?? '',
        JSON.stringify(measurements ?? {}), JSON.stringify(consultation ?? { requested: false, status: 'none' }),
      ]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create booking' })
  }
}

async function updateBooking(req, res) {
  const { id } = req.params
  try {
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM "Booking" WHERE id = $1 AND "designerId" = $2 LIMIT 1`,
      [id, req.userId]
    )
    const existing = existingRows[0]
    if (!existing) return res.status(404).json({ error: 'Booking not found' })

    const {
      status, depositPaid, consultation, designNotes, deliveryDate, price,
      depositAmount, urgent, quantity, fabrics, colors, inspirationRef, measurements,
    } = req.body

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
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
    if (depositPaid !== undefined) add('"depositPaid"', depositPaid)
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
    client, service, occasion, deliveryDate, price, depositAmount,
    clientPhone, quantity, urgent, designNotes, fabrics, colors,
    inspirationRef, measurements, consultation,
  } = req.body

  if (!client || !service || !occasion || !deliveryDate || price == null || depositAmount == null) {
    return res.status(400).json({ error: 'client, service, occasion, deliveryDate, price, and depositAmount are required for a full update' })
  }

  try {
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM "Booking" WHERE id = $1 AND "designerId" = $2 LIMIT 1`,
      [id, req.userId]
    )
    const existing = existingRows[0]
    if (!existing) return res.status(404).json({ error: 'Booking not found' })

    const { rows } = await pool.query(
      `UPDATE "Booking" SET
         client = $1,
         initials = $2,
         service = $3,
         occasion = $4,
         "deliveryDate" = $5,
         price = $6,
         "depositAmount" = $7,
         "clientPhone" = $8,
         quantity = $9,
         urgent = $10,
         "designNotes" = $11,
         fabrics = $12,
         colors = $13,
         "inspirationRef" = $14,
         measurements = $15,
         consultation = $16,
         "clientColor" = $17,
         "receivedAt" = $18
       WHERE id = $19
       RETURNING *`,
      [
        client, toInitials(client), service, occasion, deliveryDate,
        Number(price), Number(depositAmount), clientPhone ?? existing.clientPhone,
        quantity != null ? Number(quantity) : existing.quantity, urgent ?? existing.urgent,
        designNotes ?? existing.designNotes, fabrics ?? existing.fabrics, colors ?? existing.colors,
        inspirationRef ?? existing.inspirationRef,
        JSON.stringify(measurements ?? existing.measurements),
        JSON.stringify(consultation ?? existing.consultation),
        existing.clientColor, existing.receivedAt, id,
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
    const { rows } = await pool.query(
      `DELETE FROM "Booking" WHERE id = $1 AND "designerId" = $2 RETURNING *`,
      [req.params.id, req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' })
    res.json({ message: `Booking ${rows[0].id} deleted`, deleted: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete booking' })
  }
}

module.exports = { listBookings, getBooking, createBooking, updateBooking, replaceBooking, deleteBooking }