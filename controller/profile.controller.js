const { prisma } = require('../config/db')

async function getArtisanProfile(req, res) {
  try {
    let profile = await prisma.artisanProfile.findUnique({
      where: { artisanId: req.userId },
      include: { artisan: true },
    })
    if (!profile) {
      profile = await prisma.artisanProfile.create({
        data: { artisanId: req.userId, fullName: '' },
        include: { artisan: true },
      })
    }
    res.json(profile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

async function updateArtisanProfile(req, res) {
  const { fullName, specialty, location, bio, phone, yearsOfExperience, avatar, styles } = req.body
  try {
    const profile = await prisma.artisanProfile.upsert({
      where: { artisanId: req.userId },
      update: {
        ...(fullName !== undefined && { fullName }),
        ...(specialty !== undefined && { specialty }),
        ...(location !== undefined && { location }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(yearsOfExperience !== undefined && { yearsOfExperience: Number(yearsOfExperience) }),
        ...(avatar !== undefined && { avatar }),
        ...(styles !== undefined && { styles }),
      },
      create: {
        artisanId: req.userId,
        fullName: fullName ?? '',
        specialty: specialty ?? '',
        location: location ?? '',
        bio: bio ?? '',
        phone: phone ?? '',
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : 0,
        avatar: avatar ?? null,
        styles: styles ?? [],
      },
      include: { artisan: true },
    })
    res.json(profile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

async function getArtisanAvailability(req, res) {
  const { artisanId } = req.params
  try {
    const availability = await prisma.availability.findMany({
      where: { artisanId },
      select: { date: true, status: true },
    })
    res.status(200).json({ availability })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch availability' })
  }
}

module.exports = { getArtisanProfile, updateArtisanProfile, getArtisanAvailability }
