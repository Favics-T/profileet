const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const { prisma } = require('../config/db')

router.use(requireAuth, requireRole('designer'))

router.get('/', async (req, res) => {
  try {
    const conversations = await prisma.messageConversation.findMany({
      where: { designerId: req.userId },
      orderBy: { id: 'asc' },
      include: { messages: true, designer: true },
    })
    res.json(conversations.map((c) => ({
      id: c.id,
      designer: c.designerName,
      initials: c.initials,
      color: c.color,
      lastMessage: c.lastMessage,
      time: c.time,
      unread: c.unread,
      messages: c.messages.map((m) => ({ id: m.id, from: m.from, text: m.text, time: m.time })),
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

router.patch('/:id/read', async (req, res) => {
  try {
    const existing = await prisma.messageConversation.findFirst({
      where: { id: Number(req.params.id), designerId: req.userId },
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
})

router.post('/:id/messages', async (req, res) => {
  const { text } = req.body
  if (!text || !text.trim()) return res.status(400).json({ error: 'Message text is required' })

  try {
    const conversation = await prisma.messageConversation.findFirst({
      where: { id: Number(req.params.id), designerId: req.userId },
    })
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' })

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        from: 'client',
        text: text.trim(),
        time: 'Just now',
      },
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
})

module.exports = router
