const { pool } = require('../config/db')


async function getReviewStats(artisanUserIds) {
  if (artisanUserIds.length === 0) return new Map()

  const { rows } = await pool.query(
    `SELECT
       "designerId" AS "artisanId",
       COALESCE(AVG(rating), 0) AS avg_rating,
       COUNT(id) AS review_count
     FROM "Review"
     WHERE "designerId" = ANY($1)
     GROUP BY "designerId"`,
    [artisanUserIds]
  )

  return new Map(
    rows.map((r) => [
      r.artisanId,
      { rating: Number(r.avg_rating), reviews: Number(r.review_count) },
    ])
  )
}




function mapArtisan(profile, statsMap) {
  const stats = statsMap?.get(profile.artisanId) ?? { rating: 0, reviews: 0 }
  return {
    ...profile,
    rating: Math.round(stats.rating * 10) / 10,
    reviews: stats.reviews,
    notes: profile.notes ?? [],
  }
}


async function listArtisans(req, res) {
  try {
    const { location, city, state, country, specialty, available, q, minBudget, maxBudget } = req.query
    const conditions = []
    const values = []
    let i = 1

    if (location) {
      conditions.push(`LOWER("location") LIKE LOWER($${i})`)
      values.push(`%${location}%`)
      i++
    }

    if (city) {
      conditions.push(`LOWER("city") LIKE LOWER($${i})`)
      values.push(`%${city}%`)
      i++
    }

    if (state) {
      conditions.push(`LOWER("state") LIKE LOWER($${i})`)
      values.push(`%${state}%`)
      i++
    }

    if (country) {
      conditions.push(`LOWER("country") LIKE LOWER($${i})`)
      values.push(`%${country}%`)
      i++
    }

    if (specialty) {
      conditions.push(`LOWER("specialty") LIKE LOWER($${i})`)
      values.push(`%${specialty}%`)
      i++
    }

    if (available !== undefined) {
      conditions.push(`"available" = $${i}`)
      values.push(String(available).toLowerCase() === 'true')
      i++
    }

    if (q) {
      conditions.push(`(
        LOWER("fullName") LIKE LOWER($${i})
        OR LOWER("specialty") LIKE LOWER($${i})
        OR LOWER("location") LIKE LOWER($${i})
        OR LOWER("bio") LIKE LOWER($${i})
      )`)
      values.push(`%${q}%`)
      i++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const budgetClause = []
    const budgetValues = []
    let b = 1
    if (minBudget !== undefined && minBudget !== '') {
      budgetClause.push(`COALESCE(pr."startingPrice", 0) >= $${b}`)
      budgetValues.push(Number(minBudget))
      b++
    }
    if (maxBudget !== undefined && maxBudget !== '') {
      budgetClause.push(`COALESCE(pr."startingPrice", 0) <= $${b}`)
      budgetValues.push(Number(maxBudget))
      b++
    }

    const { rows: artisans } = await pool.query(
      `SELECT ap.*, pr.currency, pr."startingPrice", pr."hourlyRate", pr."consultationFee",
              pr."deliveryFee", pr."minimumBudget", pr.notes AS pricing_notes
       FROM "ArtisanProfile" ap
       LEFT JOIN "ArtisanPricing" pr ON pr."artisanId" = ap."artisanId"
       ${whereClause}${budgetClause.length > 0 ? (whereClause ? ' AND ' : 'WHERE ') + budgetClause.join(' AND ') : ''}
       ORDER BY "createdAt" DESC`,
      [...values, ...budgetValues]
    )

    const ids = artisans.map((a) => a.id)
    let notesByArtisan = new Map()
    if (ids.length > 0) {
      const { rows: notes } = await pool.query(
        `SELECT * FROM "ArtisanNote" WHERE "artisanProfileId" = ANY($1)`,
        [ids]
      )
      notesByArtisan = notes.reduce((map, note) => {
        const list = map.get(note.artisanProfileId) ?? []
        list.push(note)
        map.set(note.artisanProfileId, list)
        return map
      }, new Map())
    }

    const withNotes = artisans.map((a) => ({
      ...a,
      notes: notesByArtisan.get(a.id) ?? [],
    }))

    const statsMap = await getReviewStats(artisans.map((a) => a.artisanId))
    res.json(withNotes.map((a) => mapArtisan(a, statsMap)))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch artisans' })
  }
}


async function listArtisanFilters(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT specialty, city, state, styles FROM "ArtisanProfile"`
    )

    const specialtyCounts = {}
    const stateCounts = {}
    const cityCounts = {}
    const styleCounts = {}

    for (const row of rows) {
      if (row.specialty) {
        specialtyCounts[row.specialty] = (specialtyCounts[row.specialty] || 0) + 1
      }

      if (row.state) {
        stateCounts[row.state] = (stateCounts[row.state] || 0) + 1
      }

      if (row.city) {
        const key = row.city + '|' + row.state
        if (!cityCounts[key]) {
          cityCounts[key] = { value: row.city, state: row.state, count: 0 }
        }
        cityCounts[key].count = cityCounts[key].count + 1
      }

      if (row.styles) {
        for (const style of row.styles) {
          styleCounts[style] = (styleCounts[style] || 0) + 1
        }
      }
    }

    const specialties = Object.keys(specialtyCounts).map((key) => ({ value: key, count: specialtyCounts[key] }))
    const states = Object.keys(stateCounts).map((key) => ({ value: key, count: stateCounts[key] }))
    const cities = Object.values(cityCounts)
    const styles = Object.keys(styleCounts).map((key) => ({ value: key, count: styleCounts[key] }))

    res.json({ states, cities, specialties, styles })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch artisan filters' })
  }
}


async function getArtisan(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM "ArtisanProfile"
       WHERE id = $1`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Artisan not found' })
    const artisan = rows[0]

    const { rows: notes } = await pool.query(
      `SELECT * FROM "ArtisanNote" WHERE "artisanProfileId" = $1`,
      [artisan.id]
    )
    artisan.notes = notes

    const { rows: portfolioItems } = await pool.query(
      `SELECT id, title, tag, description, "imageUrl", "createdAt", "updatedAt"
       FROM "PortfolioItem"
       WHERE "designerId" = $1
       ORDER BY "createdAt" DESC
       LIMIT 6`,
      [artisan.artisanId]
    )
    artisan.portfolioItems = portfolioItems

    const { rows: reviewRows } = await pool.query(
      `SELECT id, client, initials, color, service, rating, date, text, helpful, replied, reply, "createdAt"
       FROM "Review"
       WHERE "designerId" = $1
       ORDER BY "createdAt" DESC
       LIMIT 10`,
      [artisan.artisanId]
    )
    artisan.reviewsList = reviewRows

    const { rows: pricingRows } = await pool.query(
      `SELECT *
       FROM "ArtisanPricing"
       WHERE "artisanId" = $1`,
      [artisan.artisanId]
    )
    artisan.pricing = pricingRows[0] ?? null

    const statsMap = await getReviewStats([artisan.artisanId])
    res.json(mapArtisan(artisan, statsMap))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch artisan' })
  }
}


async function updateArtisan(req, res) {
  try {
    const { rows: existingRows } = await pool.query(
      `SELECT id FROM "ArtisanProfile" WHERE id = $1`,
      [req.params.id]
    )
    if (existingRows.length === 0) return res.status(404).json({ error: 'Artisan not found' })

    
    const fieldMap = {
      specialty: 'specialty',
      location: 'location',
      city: 'city',
      state: 'state',
      country: 'country',
      available: 'available',
      status: 'status',
      joined: 'joined',
      fullName: '"fullName"',
      bio: 'bio',
      phone: 'phone',
      yearsOfExperience: '"yearsOfExperience"',
      initials: 'initials',
      color: 'color',
      styles: 'styles',
    }

    const setClauses = []
    const values = []
    let i = 1

    for (const [field, column] of Object.entries(fieldMap)) {
      if (req.body[field] === undefined) continue
      let value = req.body[field]
      if (field === 'yearsOfExperience') value = Number(value)
      const castSuffix = field === 'status' ? '::"ArtisanStatus"' : ''
      setClauses.push(`${column} = $${i}${castSuffix}`)
      values.push(value)
      i++
    }

    
    if (setClauses.length === 0) {
     
      const { rows } = await pool.query(`SELECT * FROM "ArtisanProfile" WHERE id = $1`, [req.params.id])
      const artisan = rows[0]
      const { rows: notes } = await pool.query(`SELECT * FROM "ArtisanNote" WHERE "artisanProfileId" = $1`, [artisan.id])
      artisan.notes = notes
      const statsMap = await getReviewStats([artisan.artisanId])
      return res.json(mapArtisan(artisan, statsMap))
    }

    values.push(req.params.id) 
    const { rows: updatedRows } = await pool.query(
      `UPDATE "ArtisanProfile"
       SET ${setClauses.join(', ')}
       WHERE id = $${i}
       RETURNING *`,
      values
    )
    const updated = updatedRows[0]

    const { rows: notes } = await pool.query(
      `SELECT * FROM "ArtisanNote" WHERE "artisanProfileId" = $1`,
      [updated.id]
    )
    updated.notes = notes

    const statsMap = await getReviewStats([updated.artisanId])
    res.json(mapArtisan(updated, statsMap))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update artisan' })
  }
}


async function addArtisanNote(req, res) {
  const { author, role, content } = req.body
  if (!content || !content.trim()) return res.status(400).json({ error: 'Note content is required' })

  try {
    const { rows: artisanRows } = await pool.query(
      `SELECT id FROM "ArtisanProfile" WHERE id = $1`,
      [req.params.id]
    )
    if (artisanRows.length === 0) return res.status(404).json({ error: 'Artisan not found' })

    const createdAt = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    const { rows } = await pool.query(
      `INSERT INTO "ArtisanNote" ("artisanProfileId", author, role, content, "createdAt")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.params.id, author || 'Staff', role || 'support_agent', content.trim(), createdAt]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save note' })
  }
}

module.exports = { listArtisans, listArtisanFilters, getArtisan, updateArtisan, addArtisanNote }
