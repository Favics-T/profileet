const express = require('express')
const router = express.Router()
const { prisma } = require('../config/db')
const { requireAuth, requireRole } = require('../middleware/auth')


router.post('/', async (req, res) => {
  const { designerId } = req.query
  if (!designerId) {
    return res.status(400).json({ error: 'designerId query param is required' })
  }

  try {
    
    const designer = await prisma.user.findUnique({ where: { id: designerId } })
    if (!designer) return res.status(404).json({ error: 'Designer not found' })

    await prisma.profileView.create({ data: { designerId } })
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
      prisma.profileView.count({ where: { designerId: req.userId } }),
      prisma.profileView.count({
        where: { designerId: req.userId, createdAt: { gte: startOfWeek } },
      }),
    ])

    res.json({ total, thisWeek })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch view stats' })
  }
})

module.exports = router
