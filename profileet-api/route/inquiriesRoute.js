const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const { prisma } = require('../config/db')

const VALID_STATUSES = ['New', 'Replied', 'Booked']

router.use(requireAuth, requireRole('designer'))

router.get('/', async (req, res) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(inquiries)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch inquiries' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const inquiry = await prisma.inquiry.findUnique({ where: { id: req.params.id } })
    if (!inquiry) return res.status(404).json({ error: '404 not found' })
    res.json(inquiry)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch inquiry' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const inquiry = await prisma.inquiry.findUnique({ where: { id: req.params.id } })
    if (!inquiry) return res.status(404).json({ error: 'Not found' })

    const { status } = req.body
    if (!status) return res.status(400).json({ message: 'Status is required' })

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
    }

    const updated = await prisma.inquiry.update({
      where: { id: req.params.id },
      data: { status },
    })

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update inquiry' })
  }
})

module.exports = router
