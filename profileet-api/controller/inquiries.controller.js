const { prisma } = require('../config/db')
const { paginate } = require('../middleware/paginate')

const VALID_STATUSES = ['New', 'Replied', 'Booked']

async function listInquiries(req, res) {
  try {
    const { skip, take, page, limit } = paginate(req)
    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({ where: { artisanId: req.userId }, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.inquiry.count({ where: { artisanId: req.userId } }),
    ])
    res.json({ data: inquiries, page, limit, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch inquiries' })
  }
}

async function getInquiry(req, res) {
  try {
    const inquiry = await prisma.inquiry.findFirst({ where: { id: req.params.id, artisanId: req.userId } })
    if (!inquiry) return res.status(404).json({ error: '404 not found' })
    res.json(inquiry)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch inquiry' })
  }
}

async function updateInquiry(req, res) {
  try {
    const inquiry = await prisma.inquiry.findFirst({ where: { id: req.params.id, artisanId: req.userId } })
    if (!inquiry) return res.status(404).json({ error: 'Not found' })
    const { status } = req.body
    if (!status) return res.status(400).json({ message: 'Status is required' })
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
    const updated = await prisma.inquiry.update({ where: { id: req.params.id }, data: { status } })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update inquiry' })
  }
}

module.exports = { listInquiries, getInquiry, updateInquiry }
