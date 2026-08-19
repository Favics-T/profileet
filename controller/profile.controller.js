const { pool } = require('../config/db')

async function getArtisanProfile(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT ap.*, u.id AS "userId", u.name, u.email, u.role
       FROM "ArtisanProfile" ap
       JOIN "User" u ON u.id = ap."artisanId"
       WHERE ap."artisanId" = $1
       LIMIT 1`,
      [req.userId]
    )

    let profile = rows[0]
    if (!profile) {
      const { rows: createdRows } = await pool.query(
        `INSERT INTO "ArtisanProfile" ("artisanId", "fullName")
         VALUES ($1, '')
         RETURNING *`,
        [req.userId]
      )

      const { rows: joinedRows } = await pool.query(
        `SELECT ap.*, u.id AS "userId", u.name, u.email, u.role
         FROM "ArtisanProfile" ap
         JOIN "User" u ON u.id = ap."artisanId"
         WHERE ap.id = $1
         LIMIT 1`,
        [createdRows[0].id]
      )
      profile = joinedRows[0]
    }

    res.json(profile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

async function updateArtisanProfile(req, res) {
  const { fullName, specialty, location, bio, phone, yearsOfExperience, avatar, styles } = req.body
  try {
    const { rows: existingRows } = await pool.query(
      `SELECT id FROM "ArtisanProfile" WHERE "artisanId" = $1 LIMIT 1`,
      [req.userId]
    )
    const existing = existingRows[0]

    if (!existing) {
      const { rows: createdRows } = await pool.query(
        `INSERT INTO "ArtisanProfile" (
           "artisanId", "fullName", specialty, location, bio, phone,
           "yearsOfExperience", avatar, styles
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          req.userId,
          fullName ?? '',
          specialty ?? '',
          location ?? '',
          bio ?? '',
          phone ?? '',
          yearsOfExperience ? Number(yearsOfExperience) : 0,
          avatar ?? null,
          styles ?? [],
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

    if (fullName !== undefined) add('"fullName"', fullName)
    if (specialty !== undefined) add('specialty', specialty)
    if (location !== undefined) add('location', location)
    if (bio !== undefined) add('bio', bio)
    if (phone !== undefined) add('phone', phone)
    if (yearsOfExperience !== undefined) add('"yearsOfExperience"', Number(yearsOfExperience))
    if (avatar !== undefined) add('avatar', avatar)
    if (styles !== undefined) add('styles', styles)

    if (updates.length === 0) {
      const { rows } = await pool.query(
        `SELECT * FROM "ArtisanProfile" WHERE "artisanId" = $1 LIMIT 1`,
        [req.userId]
      )
      return res.json(rows[0])
    }

    values.push(req.userId)
    const { rows } = await pool.query(
      `UPDATE "ArtisanProfile"
       SET ${updates.join(', ')}
       WHERE "artisanId" = $${i}
       RETURNING *`,
      values
    )

    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

async function getArtisanAvailability(req, res) {
  const { artisanId } = req.params
  try {
    const { rows } = await pool.query(
      `SELECT date, status
       FROM "Availability"
       WHERE "designerId" = $1
       ORDER BY date ASC`,
      [artisanId]
    )
    res.status(200).json({ availability: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch availability' })
  }
}

module.exports = { getArtisanProfile, updateArtisanProfile, getArtisanAvailability }
