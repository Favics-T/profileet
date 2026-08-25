const cuid = require('cuid')
const { pool } = require('../config/db')
const { paginate } = require('../middleware/paginate')

async function listPortfolioItems(req, res) {
  try {
    const { skip, take, page, limit } = paginate(req)
    const [itemsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT id, title, tag, description, "imageUrl", "createdAt", "updatedAt"
         FROM "PortfolioItem"
         WHERE "designerId" = $1
         ORDER BY "createdAt" DESC
         OFFSET $2 LIMIT $3`,
        [req.userId, skip, take]
      ),
      pool.query(
        `SELECT COUNT(*) FROM "PortfolioItem" WHERE "designerId" = $1`,
        [req.userId]
      ),
    ])

    res.json({
      data: itemsResult.rows,
      page,
      limit,
      total: Number(countResult.rows[0].count),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch portfolio items' })
  }
}

async function getPortfolioItem(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM "PortfolioItem"
       WHERE id = $1 AND "designerId" = $2
       LIMIT 1`,
      [req.params.id, req.userId]
    )
    const item = rows[0]
    if (!item) return res.status(404).json({ error: 'Portfolio item not found' })
    res.json(item)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch portfolio item' })
  }
}

async function createPortfolioItem(req, res) {
  const payload = req.body
  const items = Array.isArray(payload) ? payload : [payload]

  for (const item of items) {
    if (!item.title || !item.imageUrl) {
      return res.status(400).json({ error: 'Each item must have title and imageUrl' })
    }
  }

  try {
    const created = []
    for (const item of items) {
      const { rows } = await pool.query(
        `INSERT INTO "PortfolioItem" (id, "designerId", title, tag, description, "imageUrl", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [cuid(), req.userId, item.title, item.tag || 'Other', item.description || '', item.imageUrl]
      )
      created.push(rows[0])
    }

    res.status(201).json(Array.isArray(payload) ? created : created[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save portfolio item(s)' })
  }
}

async function updatePortfolioItem(req, res) {
  const { id } = req.params
  const { title, tag, description } = req.body

  try {
    const { rows: existingRows } = await pool.query(
      `SELECT id
       FROM "PortfolioItem"
       WHERE id = $1 AND "designerId" = $2
       LIMIT 1`,
      [id, req.userId]
    )
    if (existingRows.length === 0) return res.status(404).json({ error: 'Portfolio item not found' })

    const updates = []
    const values = []
    let i = 1
    const add = (column, value) => {
      updates.push(`${column} = $${i}`)
      values.push(value)
      i++
    }

    if (title !== undefined) add('title', title)
    if (tag !== undefined) add('tag', tag)
    if (description !== undefined) add('description', description)

    if (updates.length === 0) {
      const { rows } = await pool.query(`SELECT * FROM "PortfolioItem" WHERE id = $1`, [id])
      return res.json(rows[0])
    }

    values.push(id)
    const { rows } = await pool.query(
      `UPDATE "PortfolioItem"
       SET ${updates.join(', ')}
       WHERE id = $${i}
       RETURNING *`,
      values
    )

    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update portfolio item' })
  }
}

async function deletePortfolioItem(req, res) {
  try {
    const { rows } = await pool.query(
      `DELETE FROM "PortfolioItem"
       WHERE id = $1 AND "designerId" = $2
       RETURNING *`,
      [req.params.id, req.userId]
    )
    const deleted = rows[0]
    if (!deleted) return res.status(404).json({ error: 'Portfolio item not found' })
    res.json({ message: `Portfolio item ${deleted.id} deleted`, deleted })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete portfolio item' })
  }
}

module.exports = { listPortfolioItems, getPortfolioItem, createPortfolioItem, updatePortfolioItem, deletePortfolioItem }
