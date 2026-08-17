const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const { prisma } = require('../config/db')

router.use(requireAuth, requireRole('designer'))

router.get('/', async (req, res) => {
  try {
    let profile = await prisma.designerProfile.findUnique({
      where: { designerId: req.userId },
    })

    if (!profile) {
      profile = await prisma.designerProfile.create({
        data: { designerId: req.userId },
      })
    }

    res.json(profile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

router.patch('/', async (req, res) => {
  const { fullName, specialty, location, bio, phone, yearsOfExperience, avatar } = req.body

  try {
    const profile = await prisma.designerProfile.upsert({
      where: { designerId: req.userId },
      update: {
        ...(fullName !== undefined && { fullName }),
        ...(specialty !== undefined && { specialty }),
        ...(location !== undefined && { location }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(yearsOfExperience !== undefined && { yearsOfExperience: Number(yearsOfExperience) }),
        ...(avatar !== undefined && { avatar }),
      },
      create: {
        designerId: req.userId,
        fullName: fullName ?? '',
        specialty: specialty ?? '',
        location: location ?? '',
        bio: bio ?? '',
        phone: phone ?? '',
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : 0,
        avatar: avatar ?? null,
      },
    })

    res.json(profile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})


router.get('/:designerId/availability', requireAuth, async (req, res) => {
  const { designerId } = req.params;
  try {
    const availability = await prisma.availability.findMany({
      where: { designerId },
      select: { date: true, status: true }
    });
    res.status(200).json({ availability });
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch availability' })
  }
});

module.exports = router
