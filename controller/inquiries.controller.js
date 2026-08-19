const { pool } = require('../config/db')
const { paginate } = require('../middleware/paginate')

const VALID_STATUSES = ['New', 'Replied', 'Booked']

async function listInquiries(req, res) {
  try {
    const { skip, take, page, limit } = paginate(req)

    const [{ rows: inquiries }, countResult] = await Promise.all([
      pool.query(
        `SELECT *
         FROM "Inquiry"
         WHERE "designerId" = $1
         ORDER BY "createdAt" DESC
         OFFSET $2 LIMIT $3`,
        [req.userId, skip, take]
      ),
      pool.query(
        `SELECT COUNT(*) FROM "Inquiry" WHERE "designerId" = $1`,
        [req.userId]
      ),
    ])

    res.json({ data: inquiries, page, limit, total: Number(countResult.rows[0].count) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch inquiries' })
  }
}

async function getInquiry(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM "Inquiry"
       WHERE id = $1 AND "designerId" = $2
       LIMIT 1`,
      [req.params.id, req.userId]
    )
    const inquiry = rows[0]
    if (!inquiry) return res.status(404).json({ error: '404 not found' })
    res.json(inquiry)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch inquiry' })
  }
}

async function updateInquiry(req, res) {
  try {
    const { rows: existingRows } = await pool.query(
      `SELECT *
       FROM "Inquiry"
       WHERE id = $1 AND "designerId" = $2
       LIMIT 1`,
      [req.params.id, req.userId]
    )
    const inquiry = existingRows[0]
    if (!inquiry) return res.status(404).json({ error: 'Not found' })

    const { status } = req.body
    if (!status) return res.status(400).json({ message: 'Status is required' })
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
    }

    const { rows } = await pool.query(
      `UPDATE "Inquiry"
       SET status = $1
       WHERE id = $2 AND "designerId" = $3
       RETURNING *`,
      [status, req.params.id, req.userId]
    )

    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update inquiry' })
  }
}

module.exports = { listInquiries, getInquiry, updateInquiry }
