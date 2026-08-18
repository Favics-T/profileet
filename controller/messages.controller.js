const { prisma } = require('../config/db')
const { paginate } = require('../middleware/paginate')

async function listConversations(req, res) {
  try {
    const { skip, take, page, limit } = paginate(req)
    const [conversations, total] = await Promise.all([
      prisma.messageConversation.findMany({
        where: { artisanId: req.userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
        include: { messages: true, artisan: true },
      }),
      prisma.messageConversation.count({ where: { artisanId: req.userId } }),
    ])
    res.json({
      data: conversations.map((c) => ({
        id: c.id,
        artisan: c.artisanName,
        initials: c.initials,
        color: c.color,
        lastMessage: c.lastMessage,
        time: c.time,
        unread: c.unread,
        messages: c.messages.map((m) => ({ id: m.id, from: m.from, text: m.text, time: m.time })),
      })),
      page,
      limit,
      total,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
}

async function markConversationRead(req, res) {
  try {
    const existing = await prisma.messageConversation.findFirst({
      where: { id: Number(req.params.id), artisanId: req.userId },
    })
    if (!existing) return res.status(404).json({ error: 'Conversation not found' })
    const updated = await prisma.messageConversation.update({
      where: { id: Number(req.params.id) },
      data: { unread: 0 },
      include: { messages: true },
    })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to mark conversation read' })
  }
}

async function sendMessage(req, res) {
  const { text } = req.body
  if (!text || !text.trim()) return res.status(400).json({ error: 'Message text is required' })
  try {
    const conversation = await prisma.messageConversation.findFirst({
      where: { id: Number(req.params.id), artisanId: req.userId },
    })
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' })
    const message = await prisma.message.create({
      data: { conversationId: conversation.id, from: req.role, text: text.trim(), time: new Date().toISOString() },
    })
    await prisma.messageConversation.update({
      where: { id: conversation.id },
      data: { lastMessage: message.text, time: message.time, unread: 0 },
    })
    res.status(201).json({ id: message.id, from: message.from, text: message.text, time: message.time })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

module.exports = { listConversations, markConversationRead, sendMessage }
