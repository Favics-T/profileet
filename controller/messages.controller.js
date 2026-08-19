const cuid = require('cuid')
const { pool } = require('../config/db')
const { paginate } = require('../middleware/paginate')

async function listConversations(req, res) {
  try {
    const { skip, take, page, limit } = paginate(req)
    const [conversationsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT mc.id, mc."artisanName", mc.initials, mc.color, mc."lastMessage", mc.time, mc.unread,
                m.id AS message_id, m.from AS message_from, m.text AS message_text, m.time AS message_time
         FROM "MessageConversation" mc
         LEFT JOIN "Message" m ON m."conversationId" = mc.id
         WHERE mc."designerId" = $1
         ORDER BY mc."updatedAt" DESC, m."createdAt" ASC
         OFFSET $2 LIMIT $3`,
        [req.userId, skip, take]
      ),
      pool.query(
        `SELECT COUNT(*) FROM "MessageConversation" WHERE "designerId" = $1`,
        [req.userId]
      ),
    ])

    const map = new Map()
    for (const row of conversationsResult.rows) {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          artisan: row.artisName || row.artisanName,
          initials: row.initials,
          color: row.color,
          lastMessage: row.lastMessage,
          time: row.time,
          unread: row.unread,
          messages: [],
        })
      }
      if (row.message_id) {
        map.get(row.id).messages.push({
          id: row.message_id,
          from: row.message_from,
          text: row.message_text,
          time: row.message_time,
        })
      }
    }

    res.json({
      data: [...map.values()],
      page,
      limit,
      total: Number(countResult.rows[0].count),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
}

async function markConversationRead(req, res) {
  try {
    const { rows } = await pool.query(
      `UPDATE "MessageConversation"
       SET unread = 0
       WHERE id = $1 AND "designerId" = $2
       RETURNING *`,
      [Number(req.params.id), req.userId]
    )
    const updated = rows[0]
    if (!updated) return res.status(404).json({ error: 'Conversation not found' })
    const { rows: messages } = await pool.query(
      `SELECT id, from, text, time
       FROM "Message"
       WHERE "conversationId" = $1
       ORDER BY "createdAt" ASC`,
      [updated.id]
    )
    res.json({ ...updated, messages })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to mark conversation read' })
  }
}

async function sendMessage(req, res) {
  const { text } = req.body
  if (!text || !text.trim()) return res.status(400).json({ error: 'Message text is required' })

  try {
    const { rows: conversationRows } = await pool.query(
      `SELECT id
       FROM "MessageConversation"
       WHERE id = $1 AND "designerId" = $2
       LIMIT 1`,
      [Number(req.params.id), req.userId]
    )
    const conversation = conversationRows[0]
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' })

    const time = new Date().toISOString()
    const messageId = cuid()
    const { rows: messageRows } = await pool.query(
      `INSERT INTO "Message" (id, "conversationId", from, text, time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [messageId, conversation.id, req.role, text.trim(), time]
    )
    const message = messageRows[0]

    await pool.query(
      `UPDATE "MessageConversation"
       SET "lastMessage" = $1, time = $2, unread = 0
       WHERE id = $3`,
      [message.text, message.time, conversation.id]
    )

    res.status(201).json({ id: message.id, from: message.from, text: message.text, time: message.time })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

module.exports = { listConversations, markConversationRead, sendMessage }
