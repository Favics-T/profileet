const { prisma } = require('../config/db')

async function createProfileView(req, res) {
  const { artisanId } = req.query
  if (!artisanId) return res.status(400).json({ error: 'artisanId query param is required' })
  try {
    const artisan = await prisma.user.findUnique({ where: { id: artisanId } })
    if (!artisan) return res.status(404).json({ error: 'Artisan not found' })
    await prisma.profileView.create({ data: { artisanId } })
    res.status(201).json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to record view' })
  }
}

async function getProfileViewStats(req, res) {
  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const [total, thisWeek] = await Promise.all([
      prisma.profileView.count({ where: { artisanId: req.userId } }),
      prisma.profileView.count({ where: { artisanId: req.userId, createdAt: { gte: startOfWeek } } }),
    ])
    res.json({ total, thisWeek })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch view stats' })
  }
}

module.exports = { createProfileView, getProfileViewStats }
