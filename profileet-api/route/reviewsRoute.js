const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/auth')
const { prisma } = require('../config/db')

const VALID_RATINGS = [1, 2, 3, 4, 5]

router.use(requireAuth)


router.get('/', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(reviews)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } })
    if (!review) return res.status(404).json({ error: 'Review not found' })
    res.json(review)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review' })
  }
})


router.post('/', async (req, res) => {
  const { client, initials, color, service, rating, date, text, bookingId } = req.body

  if (!client || !service || !text || rating == null) {
    return res.status(400).json({ error: 'client, service, text, and rating are required' })
  }
  if (!VALID_RATINGS.includes(Number(rating))) {
    return res.status(400).json({ error: 'rating must be 1–5' })
  }

  try {
    const review = await prisma.review.create({
      data: {
        client,
        initials: initials || client.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        color: color || '#422a15',
        service,
        rating: Number(rating),
        date: date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
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


router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { reply, incrementHelpful } = req.body

  try {
    const existing = await prisma.review.findUnique({ where: { id } })
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
      return res.status(400).json({ error: 'Nothing to update — send reply or incrementHelpful' })
    }

    const updated = await prisma.review.update({ where: { id }, data })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update review' })
  }
})


router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Review not found' })
    const deleted = await prisma.review.delete({ where: { id: req.params.id } })
    res.json({ message: `Review ${deleted.id} deleted`, deleted })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' })
  }
})

module.exports = router
