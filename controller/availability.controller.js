const { prisma } = require('../config/db')

const VALID_STATUSES = ['open', 'busy', 'off']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekDays(req, res) {
  res.json(WEEKDAYS)
}

async function listAvailability(req, res) {
  try {
    const rows = await prisma.availability.findMany({ where: { artisanId: req.userId } })
    const dayStatuses = rows.reduce((acc, row) => {
      acc[row.date] = row.status
      return acc
    }, {})
    res.json(dayStatuses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch availability' })
  }
}

async function getAvailabilityByDate(req, res) {
  try {
    const row = await prisma.availability.findFirst({
      where: { date: req.params.date, artisanId: req.userId },
    })
    if (!row) return res.status(404).json({ error: `No status found for date ${req.params.date}` })
    res.json({ date: row.date, status: row.status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch availability for date' })
  }
}

async function upsertAvailability(req, res) {
  const entries = Array.isArray(req.body) ? req.body : [req.body]
  for (const entry of entries) {
    const { date, status } = entry
    if (!date || !status) return res.status(400).json({ error: 'Each entry must have a date (YYYY-MM-DD) and a status' })
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  try {
    await Promise.all(entries.map(async (entry) => {
      const existing = await prisma.availability.findFirst({ where: { date: entry.date, artisanId: req.userId } })
      if (existing) return prisma.availability.update({ where: { id: existing.id }, data: { status: entry.status } })
      return prisma.availability.create({ data: { date: entry.date, status: entry.status, artisanId: req.userId } })
    }))
    const rows = await prisma.availability.findMany({ where: { artisanId: req.userId } })
    const dayStatuses = rows.reduce((acc, row) => {
      acc[row.date] = row.status
      return acc
    }, {})
    res.json({ message: 'Availability updated', dayStatuses })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update availability' })
  }
}

async function deleteAvailability(req, res) {
  try {
    const row = await prisma.availability.findFirst({ where: { date: req.params.date, artisanId: req.userId } })
    if (!row) return res.status(404).json({ error: `No status found for date ${req.params.date}` })
    await prisma.availability.delete({ where: { id: row.id } })
    res.json({ message: `Status for ${req.params.date} cleared` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete availability entry' })
  }
}

module.exports = {
  getWeekDays,
  listAvailability,
  getAvailabilityByDate,
  upsertAvailability,
  deleteAvailability,
}
