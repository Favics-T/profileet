const cuid = require('cuid')
const { pool } = require('../config/db')

const VALID_STATUSES = ['open', 'busy', 'off']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekDays(req, res) {
  res.json(WEEKDAYS)
}


async function listAvailability(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM "Availability" WHERE "designerId" = $1`,
      [req.userId]
    )
    const dayStatuses = rows.reduce((acc, row) => {
      acc[row.date] = row.status
      return acc
    }, {})
    res.json(dayStatuses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch availability' })
  }
}

async function getPublicAvailability(req, res) {
  try {
    const { artisanId } = req.params
    const { rows } = await pool.query(
      `SELECT date, status
       FROM "Availability"
       WHERE "designerId" = $1
       ORDER BY date ASC`,
      [artisanId]
    )
    res.json({ artisanId, availability: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch artisan availability' })
  }
}


async function getAvailabilityByDate(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM "Availability" WHERE date = $1 AND "designerId" = $2 LIMIT 1`,
      [req.params.date, req.userId]
    )
    const row = rows[0]
    if (!row) return res.status(404).json({ error: `No status found for date ${req.params.date}` })
    res.json({ date: row.date, status: row.status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch availability for date' })
  }
}


async function upsertAvailability(req, res) {
  const entries = Array.isArray(req.body) ? req.body : [req.body]
  for (const entry of entries) {
    const { date, status } = entry
    if (!date || !status) return res.status(400).json({ error: 'Each entry must have a date (YYYY-MM-DD) and a status' })
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    for (const entry of entries) {
      await client.query(
        `INSERT INTO "Availability" (id, date, "designerId", status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("designerId", date)
         DO UPDATE SET status = EXCLUDED.status`,
        [cuid(), entry.date, req.userId, entry.status]
      )
    }

    const { rows } = await client.query(
      `SELECT * FROM "Availability" WHERE "designerId" = $1`,
      [req.userId]
    )

    await client.query('COMMIT')

    const dayStatuses = rows.reduce((acc, row) => {
      acc[row.date] = row.status
      return acc
    }, {})
    res.json({ message: 'Availability updated', dayStatuses })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Failed to update availability' })
  } finally {
    client.release()
  }
}


async function deleteAvailability(req, res) {
  try {
    const { rows } = await pool.query(
      `DELETE FROM "Availability" WHERE date = $1 AND "designerId" = $2 RETURNING id`,
      [req.params.date, req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: `No status found for date ${req.params.date}` })
    res.json({ message: `Status for ${req.params.date} cleared` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete availability entry' })
  }
}

module.exports = {
  getWeekDays,
  listAvailability,
  getPublicAvailability,
  getAvailabilityByDate,
  upsertAvailability,
  deleteAvailability,
}
