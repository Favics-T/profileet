const { pool } = require('../config/db')
const { paginate } = require('../middleware/paginate')

const VALID_RATINGS = [1, 2, 3, 4, 5]

async function listPublicReviews(req, res) {
  try {
    const { skip, take, page, limit } = paginate(req)
    const artisanId = req.params.artisanId

    const [{ rows: reviews }, countResult] = await Promise.all([
      pool.query(
        `SELECT *
         FROM "Review"
         WHERE "designerId" = $1
         ORDER BY "createdAt" DESC
         OFFSET $2 LIMIT $3`,
        [artisanId, skip, take]
      ),
      pool.query(
        `SELECT COUNT(*) FROM "Review" WHERE "designerId" = $1`,
        [artisanId]
      ),
    ])

    res.json({ data: reviews, page, limit, total: Number(countResult.rows[0].count) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
}

async function listMyReviews(req, res) {
  try {
    const { skip, take, page, limit } = paginate(req)

    const [{ rows: reviews }, countResult] = await Promise.all([
      pool.query(
        `SELECT *
         FROM "Review"
         WHERE "designerId" = $1
         ORDER BY "createdAt" DESC
         OFFSET $2 LIMIT $3`,
        [req.userId, skip, take]
      ),
      pool.query(
        `SELECT COUNT(*) FROM "Review" WHERE "designerId" = $1`,
        [req.userId]
      ),
    ])

    res.json({ data: reviews, page, limit, total: Number(countResult.rows[0].count) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
}

async function getMyReview(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM "Review"
       WHERE id = $1 AND "designerId" = $2
       LIMIT 1`,
      [req.params.id, req.userId]
    )
    const review = rows[0]
    if (!review) return res.status(404).json({ error: 'Review not found' })
    res.json(review)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch review' })
  }
}

async function updateMyReview(req, res) {
  const { id } = req.params
  const { reply, incrementHelpful } = req.body

  try {
    const { rows: existingRows } = await pool.query(
      `SELECT *
       FROM "Review"
       WHERE id = $1 AND "designerId" = $2
       LIMIT 1`,
      [id, req.userId]
    )
    const existing = existingRows[0]
    if (!existing) return res.status(404).json({ error: 'Review not found' })

    const updates = []
    const values = []
    let i = 1

    const add = (column, value) => {
      updates.push(`${column} = $${i}`)
      values.push(value)
      i++
    }

    if (reply !== undefined) {
      if (typeof reply !== 'string' || !reply.trim()) {
        return res.status(400).json({ error: 'reply must be a non-empty string' })
      }
      add('reply', reply.trim())
      add('replied', true)
    }

    if (incrementHelpful === true) {
      add('helpful', Number(existing.helpful) + 1)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nothing to update - send reply or incrementHelpful' })
    }

    values.push(id)
    const { rows } = await pool.query(
      `UPDATE "Review"
       SET ${updates.join(', ')}
       WHERE id = $${i}
       RETURNING *`,
      values
    )
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update review' })
  }
}

async function deleteMyReview(req, res) {
  try {
    const { rows } = await pool.query(
      `DELETE FROM "Review"
       WHERE id = $1 AND "designerId" = $2
       RETURNING *`,
      [req.params.id, req.userId]
    )
    const deleted = rows[0]
    if (!deleted) return res.status(404).json({ error: 'Review not found' })
    res.json({ message: `Review ${deleted.id} deleted`, deleted })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete review' })
  }
}

async function createReview(req, res) {
  const { artisanId } = req.params
  const { service, rating, text, bookingId, initials, color } = req.body

  if (!service || !text || rating == null) {
    return res.status(400).json({ error: 'service, text, and rating are required' })
  }

  if (!VALID_RATINGS.includes(Number(rating))) {
    return res.status(400).json({ error: 'rating must be 1-5' })
  }

  try {
    const { rows: artisanRows } = await pool.query(
      `SELECT id, name
       FROM "User"
       WHERE id = $1
       LIMIT 1`,
      [artisanId]
    )
    const artisan = artisanRows[0]
    if (!artisan) return res.status(404).json({ error: 'Artisan not found' })

    const clientName = artisan.name
    const clientInitials = initials || artisan.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

    const { rows } = await pool.query(
      `INSERT INTO "Review" (
         id, "designerId", client, initials, color, service, rating, date, text, helpful, replied, reply, "bookingId", "updatedAt"
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, false, NULL, $10, NOW())
       RETURNING *`,
      [
        require('cuid')(),
        artisanId,
        clientName,
        clientInitials,
        color || '#422a15',
        service,
        Number(rating),
        new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        text,
        bookingId || null,
      ]
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create review' })
  }
}

module.exports = { listPublicReviews, listMyReviews, getMyReview, updateMyReview, deleteMyReview, createReview }
