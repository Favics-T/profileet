const { pool } = require('../config/db')

async function createProfileView(req, res) {
  const { artisanId } = req.query
  if (!artisanId) return res.status(400).json({ error: 'artisanId query param is required' })

  try {
    const { rows: artisanRows } = await pool.query(
      `SELECT id
       FROM "User"
       WHERE id = $1
       LIMIT 1`,
      [artisanId]
    )
    if (artisanRows.length === 0) return res.status(404).json({ error: 'Artisan not found' })

    await pool.query(
      `INSERT INTO "ProfileView" (id, "designerId")
       VALUES ($1, $2)`,
      [require('cuid')(), artisanId]
    )

    res.status(201).json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to record view' })
  }
}

async function getProfileViewStats(req, res) {
  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfWeek.getDate() - 7)

    const [totalResult, thisWeekResult, lastWeekResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total
         FROM "ProfileView"
         WHERE "designerId" = $1`,
        [req.userId]
      ),
      pool.query(
        `SELECT COUNT(*) AS total
         FROM "ProfileView"
         WHERE "designerId" = $1 AND "createdAt" >= $2`,
        [req.userId, startOfWeek]
      ),
      pool.query(
        `SELECT COUNT(*) AS total
         FROM "ProfileView"
         WHERE "designerId" = $1 AND "createdAt" >= $2 AND "createdAt" < $3`,
        [req.userId, startOfLastWeek, startOfWeek]
      ),
    ])

    res.json({
      total: Number(totalResult.rows[0].total),
      thisWeek: Number(thisWeekResult.rows[0].total),
      lastWeek: Number(lastWeekResult.rows[0].total),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch view stats' })
  }
}

module.exports = { createProfileView, getProfileViewStats }
