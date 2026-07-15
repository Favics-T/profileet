const express = require('express')
const router = express.Router()

let dayStatuses = {}

const VALID_STATUSES = ['open', 'busy', 'off']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


router.get('/weekdays', (req, res) => {
  res.json(WEEKDAYS)
})

router.get('/', (req, res) => {
  res.json(dayStatuses)
})

router.get('/:date', (req, res) => {
  const { date } = req.params
  const status = dayStatuses[date]

  if (!status) {
    return res.status(404).json({ error: `No status found for date ${date}` })
  }

  res.json({ date, status })
})

router.post('/', (req, res) => {
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
    dayStatuses[date] = status
  }

  res.json({ message: 'Availability updated', dayStatuses })
})


router.delete('/:date', (req, res) => {
  const { date } = req.params
  if (!dayStatuses[date]) {
    return res.status(404).json({ error: `No status found for date ${date}` })
  }
  delete dayStatuses[date]
  res.json({ message: `Status for ${date} cleared`, dayStatuses })
})

module.exports = router
