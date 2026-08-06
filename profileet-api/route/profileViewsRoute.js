const express = require('express')
const router = express.Router()
const { prisma } = require('../config/db')
const { requireAuth, requireRole } = require('../middleware/auth')

router.post('/', async (req, res) => {
  try {
    await prisma.profileView.create({ data: {} })
    res.status(201).json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to record view' })
  }
})

router.get('/stats', requireAuth, requireRole('designer'), async (req, res) => {
  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const [total, thisWeek] = await Promise.all([
      prisma.profileView.count(),
      prisma.profileView.count({ where: { createdAt: { gte: startOfWeek } } }),
    ])

    res.json({ total, thisWeek })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch view stats' })
  }
})

module.exports = router
