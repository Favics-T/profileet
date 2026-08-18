const { prisma } = require('../config/db')
const { paginate } = require('../middleware/paginate')

async function listPortfolioItems(req, res) {
  try {
    const { skip, take, page, limit } = paginate(req)
    const [items, total] = await Promise.all([
      prisma.portfolioItem.findMany({
        where: { artisanId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: { id: true, title: true, tag: true, description: true, imageUrl: true, createdAt: true, updatedAt: true },
      }),
      prisma.portfolioItem.count({ where: { artisanId: req.userId } }),
    ])
    res.json({ data: items, page, limit, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch portfolio items' })
  }
}

async function getPortfolioItem(req, res) {
  try {
    const item = await prisma.portfolioItem.findFirst({ where: { id: req.params.id, artisanId: req.userId } })
    if (!item) return res.status(404).json({ error: 'Portfolio item not found' })
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio item' })
  }
}

async function createPortfolioItem(req, res) {
  const payload = req.body
  const items = Array.isArray(payload) ? payload : [payload]
  for (const item of items) {
    if (!item.title || !item.imageUrl) return res.status(400).json({ error: 'Each item must have title and imageUrl' })
  }
  try {
    const created = await Promise.all(items.map(item => prisma.portfolioItem.create({
      data: { artisanId: req.userId, title: item.title, tag: item.tag || 'Other', description: item.description || '', imageUrl: item.imageUrl },
    })))
    res.status(201).json(Array.isArray(payload) ? created : created[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save portfolio item(s)' })
  }
}

async function updatePortfolioItem(req, res) {
  const { id } = req.params
  const { title, tag, description } = req.body
  try {
    const existing = await prisma.portfolioItem.findFirst({ where: { id, artisanId: req.userId } })
    if (!existing) return res.status(404).json({ error: 'Portfolio item not found' })
    const updated = await prisma.portfolioItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(tag !== undefined && { tag }),
        ...(description !== undefined && { description }),
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update portfolio item' })
  }
}

async function deletePortfolioItem(req, res) {
  try {
    const existing = await prisma.portfolioItem.findFirst({ where: { id: req.params.id, artisanId: req.userId } })
    if (!existing) return res.status(404).json({ error: 'Portfolio item not found' })
    const deleted = await prisma.portfolioItem.delete({ where: { id: req.params.id } })
    res.json({ message: `Portfolio item ${deleted.id} deleted`, deleted })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete portfolio item' })
  }
}

module.exports = { listPortfolioItems, getPortfolioItem, createPortfolioItem, updatePortfolioItem, deletePortfolioItem }
