const express = require('express')
const router = express.Router()
const { requireAuth, requireAnyAdmin } = require('../middleware/auth')
const { prisma } = require('../config/db')

function mapDesigner(d) {
  return {
    ...d,
    notes: d.notes ?? [],
  }
}


router.get('/', async (req, res) => {
  try {
    const designers = await prisma.designer.findMany({
      orderBy: { createdAt: 'asc' },
      include: { notes: true },
    })
    res.json(designers.map(mapDesigner))
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
    res.json(mapDesigner(designer))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch designer' })
  }
})


router.patch('/:id', requireAuth, requireAnyAdmin, async (req, res) => {
  try {
    const existing = await prisma.designer.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Designer not found' })

    const updated = await prisma.designer.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.name !== undefined && { name: req.body.name }),
        ...(req.body.email !== undefined && { email: req.body.email }),
        ...(req.body.specialty !== undefined && { specialty: req.body.specialty }),
        ...(req.body.location !== undefined && { location: req.body.location }),
        ...(req.body.rating  !== undefined && { rating: Number(req.body.rating) }),
        ...(req.body.reviews !== undefined && { reviews: Number(req.body.reviews) }),
        ...(req.body.startingPrice !== undefined && { startingPrice: Number(req.body.startingPrice) }),
        ...(req.body.available !== undefined && { available: req.body.available }),
        ...(req.body.status !== undefined && { status: req.body.status }),
        ...(req.body.joined !== undefined && { joined: req.body.joined }),
        ...(req.body.bio !== undefined && { bio: req.body.bio }),
        ...(req.body.phone !== undefined && { phone: req.body.phone }),
        ...(req.body.yearsOfExperience !== undefined && { yearsOfExperience: Number(req.body.yearsOfExperience) }),
        ...(req.body.inquiries !== undefined && { inquiries: Number(req.body.inquiries) }),
        ...(req.body.bookings !== undefined && { bookings: Number(req.body.bookings) }),
        ...(req.body.initials !== undefined && { initials: req.body.initials }),
        ...(req.body.color !== undefined && { color: req.body.color }),
        ...(req.body.styles !== undefined && { styles: req.body.styles }),
      },
      include: { notes: true },
    })

    res.json(mapDesigner(updated))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update designer' })
  }
})


router.post('/:id/notes', requireAuth, requireAnyAdmin, async (req, res) => {
  const { author, role, content } = req.body
  if (!content || !content.trim()) return res.status(400).json({ error: 'Note content is required' })

  try {
    const designer = await prisma.designer.findUnique({ where: { id: req.params.id } })
    if (!designer) return res.status(404).json({ error: 'Designer not found' })

    const note = await prisma.designerNote.create({
      data: {
        id: `n${Date.now()}`,
        designerId: req.params.id,
        author: author || 'Staff',
        role: role || 'support_agent',
        content: content.trim(),
        createdAt: new Date().toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
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
