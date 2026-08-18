const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const { prisma } = require('../config/db')

const ADMIN_ROLES = ['admin']


async function getReviewStats(designerUserIds) {
  const stats = await prisma.review.groupBy({
    by: ['designerId'],
    where: { designerId: { in: designerUserIds } },
    _avg: { rating: true },
    _count: { id: true },
  })
  return new Map(stats.map(s => [s.designerId, { rating: s._avg.rating ?? 0, reviews: s._count.id }]))
}

function mapDesigner(d, statsMap) {
  const stats = statsMap?.get(d.userId) ?? { rating: 0, reviews: 0 }
  return {
    ...d,
    
    rating: Math.round(stats.rating * 10) / 10,
    reviews: stats.reviews,
    notes: d.notes ?? [],
  }
}

router.get('/', async (req, res) => {
  try {
    const designers = await prisma.designer.findMany({
      orderBy: { createdAt: 'asc' },
      include: { notes: true },
    })

    const statsMap = await getReviewStats(designers.map(d => d.userId))
    res.json(designers.map(d => mapDesigner(d, statsMap)))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch designers' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const designer = await prisma.designer.findUnique({
      where: { id: req.params.id },
      include: { notes: true },
    })
    if (!designer) return res.status(404).json({ error: 'Designer not found' })

    const statsMap = await getReviewStats([designer.userId])
    res.json(mapDesigner(designer, statsMap))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch designer' })
  }
})

router.patch('/:id', requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const existing = await prisma.designer.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Designer not found' })

    const updated = await prisma.designer.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.specialty !== undefined && { specialty: req.body.specialty }),
        ...(req.body.location !== undefined && { location: req.body.location }),
        ...(req.body.startingPrice !== undefined && { startingPrice: Number(req.body.startingPrice) }),
        ...(req.body.available !== undefined && { available: req.body.available }),
        ...(req.body.status !== undefined && { status: req.body.status }),
        ...(req.body.joined !== undefined && { joined: req.body.joined }),
        ...(req.body.bio !== undefined && { bio: req.body.bio }),
        ...(req.body.phone !== undefined && { phone: req.body.phone }),
        ...(req.body.yearsOfExperience !== undefined && { yearsOfExperience: Number(req.body.yearsOfExperience) }),
        ...(req.body.initials !== undefined && { initials: req.body.initials }),
        ...(req.body.color !== undefined && { color: req.body.color }),
        ...(req.body.styles !== undefined && { styles: req.body.styles }),
              },
      include: { notes: true },
    })

    const statsMap = await getReviewStats([updated.userId])
    res.json(mapDesigner(updated, statsMap))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update designer' })
  }
})

router.post('/:id/notes', requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { author, role, content } = req.body
  if (!content || !content.trim()) return res.status(400).json({ error: 'Note content is required' })

  try {
    const designer = await prisma.designer.findUnique({ where: { id: req.params.id } })
    if (!designer) return res.status(404).json({ error: 'Designer not found' })

    const note = await prisma.designerNote.create({
      data: {
        designerId: req.params.id,
        author: author || 'Staff',
        role: role || 'support_agent',
        content: content.trim(),
        createdAt: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      },
    })

    res.status(201).json(note)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save note' })
  }
})

module.exports = router

