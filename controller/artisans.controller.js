const { prisma } = require('../config/db')

async function getReviewStats(artisanUserIds) {
  const stats = await prisma.review.groupBy({
    by: ['artisanId'],
    where: { artisanId: { in: artisanUserIds } },
    _avg: { rating: true },
    _count: { id: true },
  })
  return new Map(stats.map((s) => [s.artisanId, { rating: s._avg.rating ?? 0, reviews: s._count.id }]))
}

function mapArtisan(profile, statsMap) {
  const stats = statsMap?.get(profile.artisanId) ?? { rating: 0, reviews: 0 }
  return { ...profile, rating: Math.round(stats.rating * 10) / 10, reviews: stats.reviews, notes: profile.notes ?? [] }
}

async function listArtisans(req, res) {
  try {
    const artisans = await prisma.artisanProfile.findMany({ orderBy: { createdAt: 'asc' }, include: { notes: true } })
    const statsMap = await getReviewStats(artisans.map((a) => a.artisanId))
    res.json(artisans.map((a) => mapArtisan(a, statsMap)))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch artisans' })
  }
}

async function getArtisan(req, res) {
  try {
    const artisan = await prisma.artisanProfile.findUnique({ where: { id: req.params.id }, include: { notes: true } })
    if (!artisan) return res.status(404).json({ error: 'Artisan not found' })
    const statsMap = await getReviewStats([artisan.artisanId])
    res.json(mapArtisan(artisan, statsMap))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch artisan' })
  }
}

async function updateArtisan(req, res) {
  try {
    const existing = await prisma.artisanProfile.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Artisan not found' })
    const updated = await prisma.artisanProfile.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.specialty !== undefined && { specialty: req.body.specialty }),
        ...(req.body.location !== undefined && { location: req.body.location }),
        ...(req.body.startingPrice !== undefined && { startingPrice: Number(req.body.startingPrice) }),
        ...(req.body.available !== undefined && { available: req.body.available }),
        ...(req.body.status !== undefined && { status: req.body.status }),
        ...(req.body.joined !== undefined && { joined: req.body.joined }),
        ...(req.body.fullName !== undefined && { fullName: req.body.fullName }),
        ...(req.body.bio !== undefined && { bio: req.body.bio }),
        ...(req.body.phone !== undefined && { phone: req.body.phone }),
        ...(req.body.yearsOfExperience !== undefined && { yearsOfExperience: Number(req.body.yearsOfExperience) }),
        ...(req.body.initials !== undefined && { initials: req.body.initials }),
        ...(req.body.color !== undefined && { color: req.body.color }),
        ...(req.body.styles !== undefined && { styles: req.body.styles }),
      },
      include: { notes: true },
    })
    const statsMap = await getReviewStats([updated.artisanId])
    res.json(mapArtisan(updated, statsMap))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update artisan' })
  }
}

async function addArtisanNote(req, res) {
  const { author, role, content } = req.body
  if (!content || !content.trim()) return res.status(400).json({ error: 'Note content is required' })
  try {
    const artisan = await prisma.artisanProfile.findUnique({ where: { id: req.params.id } })
    if (!artisan) return res.status(404).json({ error: 'Artisan not found' })
    const note = await prisma.artisanNote.create({
      data: { artisanProfileId: req.params.id, author: author || 'Staff', role: role || 'support_agent', content: content.trim(), createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
    })
    res.status(201).json(note)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save note' })
  }
}

module.exports = { listArtisans, getArtisan, updateArtisan, addArtisanNote }
