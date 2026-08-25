const { pool } = require('../config/db')

async function getClientProfile(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM "ClientProfile"
       WHERE "clientId" = $1
       LIMIT 1`,
      [req.userId]
    )

    if (rows.length > 0) {
      return res.json(rows[0])
    }

    const { rows: createdRows } = await pool.query(
      `INSERT INTO "ClientProfile" (
         "clientId", "firstName", "lastName", email, phone, location, bio,
         "bookingUpdates", "newMessages", promotions, reminders, "updatedAt"
       )
       VALUES ($1, '', '', '', '', '', '', true, true, false, true, NOW())
       RETURNING *`,
      [req.userId]
    )

    res.status(201).json(createdRows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch client profile' })
  }
}

async function updateClientProfile(req, res) {
  const { firstName, lastName, email, phone, location, bio, notifications } = req.body
  try {
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM "ClientProfile" WHERE "clientId" = $1 LIMIT 1`,
      [req.userId]
    )

    const existing = existingRows[0]

    if (!existing) {
      const { rows: createdRows } = await pool.query(
        `INSERT INTO "ClientProfile" (
           "clientId", "firstName", "lastName", email, phone, location, bio,
           "bookingUpdates", "newMessages", promotions, reminders, "updatedAt"
         )
         VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
         )
         RETURNING *`,
        [
          req.userId,
          firstName ?? '',
          lastName ?? '',
          email ?? '',
          phone ?? '',
          location ?? '',
          bio ?? '',
          notifications?.bookingUpdates ?? true,
          notifications?.newMessages ?? true,
          notifications?.promotions ?? false,
          notifications?.reminders ?? true,
        ]
      )
      return res.status(201).json(createdRows[0])
    }

    const updates = []
    const values = []
    let i = 1
    const add = (column, value) => {
      updates.push(`${column} = $${i}`)
      values.push(value)
      i++
    }

    if (firstName !== undefined) add('"firstName"', firstName)
    if (lastName !== undefined) add('"lastName"', lastName)
    if (email !== undefined) add('email', email)
    if (phone !== undefined) add('phone', phone)
    if (location !== undefined) add('location', location)
    if (bio !== undefined) add('bio', bio)
    if (notifications?.bookingUpdates !== undefined) add('"bookingUpdates"', notifications.bookingUpdates)
    if (notifications?.newMessages !== undefined) add('"newMessages"', notifications.newMessages)
    if (notifications?.promotions !== undefined) add('promotions', notifications.promotions)
    if (notifications?.reminders !== undefined) add('reminders', notifications.reminders)

    if (updates.length === 0) return res.json(existing)

    values.push(req.userId)
    const { rows } = await pool.query(
      `UPDATE "ClientProfile"
       SET ${updates.join(', ')}
       WHERE "clientId" = $${i}
       RETURNING *`,
      values
    )

    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update client profile' })
  }
}

module.exports = { getClientProfile, updateClientProfile }
