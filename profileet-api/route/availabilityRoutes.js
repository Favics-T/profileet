const express = require('express')
const router = express.Router()
const { prisma } = require('../config/db')

const VALID_STATUSES = ['open', 'busy', 'off']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

 
router.get('/weekdays', (req, res) => {
  res.json(WEEKDAYS)
})

 
router.get('/', async (req, res) => {
  try {
    const rows = await prisma.availability.findMany()
    
    const dayStatuses = rows.reduce((acc, row) => {
      acc[row.date] = row.status
      return acc
    }, {})
    res.json(dayStatuses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch availability' })
  }
})


router.get('/:date', async (req, res) => {
  try {
    const row = await prisma.availability.findUnique({ where: { date: req.params.date } })
    if (!row) {
      return res.status(404).json({ error: `No status found for date ${req.params.date}` })
    }
    res.json({ date: row.date, status: row.status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch availability for date' })
  }
})


router.post('/', async (req, res) => {
  const entries = Array.isArray(req.body) ? req.body : [req.body]

  for (const entry of entries) {
    const { date, status } = entry
    if (!date || !status) {
      return res.status(400).json({ error: 'Each entry must have a date (YYYY-MM-DD) and a status' })
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' })
    }
  }

  try {
        await Promise.all(
      entries.map((entry) =>
        prisma.availability.upsert({
          where: { date: entry.date },
          update: { status: entry.status },
          create: { date: entry.date, status: entry.status },
        })
      )
    )

       const rows = await prisma.availability.findMany()
    const dayStatuses = rows.reduce((acc, row) => {
      acc[row.date] = row.status
      return acc
    }, {})

    res.json({ message: 'Availability updated', dayStatuses })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update availability' })
  }
})


router.delete('/:date', async (req, res) => {
  try {
    const row = await prisma.availability.findUnique({ where: { date: req.params.date } })
    if (!row) {
      return res.status(404).json({ error: `No status found for date ${req.params.date}` })
    }
    await prisma.availability.delete({ where: { date: req.params.date } })

    const rows = await prisma.availability.findMany()
    const dayStatuses = rows.reduce((acc, r) => {
      acc[r.date] = r.status
      return acc
    }, {})

    res.json({ message: `Status for ${req.params.date} cleared`, dayStatuses })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete availability entry' })
  }
})

module.exports = router
