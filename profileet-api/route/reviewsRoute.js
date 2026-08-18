const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const { prisma } = require('../config/db')
const { paginate } = require('../middleware/paginate')

const VALID_RATINGS = [1, 2, 3, 4, 5]


router.get('/designer/:designerId', async (req, res) => {
  try {
    const { skip, take, page, limit } = paginate(req)
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { designerId: req.params.designerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.review.count({ where: { designerId: req.params.designerId } }),
    ])
    res.json({ data: reviews, page, limit, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})


router.get('/', requireAuth, requireRole('designer'), async (req, res) => {
  try {
    const { skip, take, page, limit } = paginate(req)
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { designerId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.review.count({ where: { designerId: req.userId } }),
    ])
    res.json({ data: reviews, page, limit, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})


router.get('/:id', requireAuth, requireRole('designer'), async (req, res) => {
  try {
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, designerId: req.userId },
    })
    if (!review) return res.status(404).json({ error: 'Review not found' })
    res.json(review)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review' })
  }
})


router.patch('/:id', requireAuth, requireRole('designer'), async (req, res) => {
  const { id } = req.params
  const { reply, incrementHelpful } = req.body

  try {
    const existing = await prisma.review.findFirst({ where: { id, designerId: req.userId } })
    if (!existing) return res.status(404).json({ error: 'Review not found' })

    const data = {}

    if (reply !== undefined) {
      if (typeof reply !== 'string' || !reply.trim()) {
        return res.status(400).json({ error: 'reply must be a non-empty string' })
      }
      data.reply = reply.trim()
      data.replied = true
    }

    if (incrementHelpful === true) {
      data.helpful = existing.helpful + 1
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Nothing to update - send reply or incrementHelpful' })
    }

    const updated = await prisma.review.update({ where: { id }, data })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update review' })
  }
})


router.delete('/:id', requireAuth, requireRole('designer'), async (req, res) => {
  try {
    const existing = await prisma.review.findFirst({
      where: { id: req.params.id, designerId: req.userId },
    })
    if (!existing) return res.status(404).json({ error: 'Review not found' })
    const deleted = await prisma.review.delete({ where: { id: req.params.id } })
    res.json({ message: `Review ${deleted.id} deleted`, deleted })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' })
  }
})


router.post('/:designerId', requireAuth, requireRole('client'), async (req, res) => {
  const { designerId } = req.params
  const { service, rating, text, bookingId, initials, color } = req.body

  if (!service || !text || rating == null) {
    return res.status(400).json({ error: 'service, text, and rating are required' })
  }
  if (!VALID_RATINGS.includes(Number(rating))) {
    return res.status(400).json({ error: 'rating must be 1-5' })
  }

  try {
    
    const artisan = await prisma.user.findUnique({ where: { id: designerId } })
    if (!artisan) return res.status(404).json({ error: 'Artisan not found' })

    const review = await prisma.review.create({
      data: {
        designerId,
        
        client: artisan.name,
        initials: initials || artisan.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        color: color || '#422a15',
        service,
        rating: Number(rating),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        text,
        bookingId: bookingId || null,
      },
    })
    res.status(201).json(review)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create review' })
  }
})

module.exports = router

