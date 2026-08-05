const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/auth')
const { prisma } = require('../config/db')

const PROFILE_ID = 1

router.use(requireAuth)


router.get('/', async (req, res) => {
  try {
    let profile = await prisma.designerProfile.findUnique({ where: { id: PROFILE_ID } })

    if (!profile) {
      
      profile = await prisma.designerProfile.create({
        data: { id: PROFILE_ID },
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
      where: { id: PROFILE_ID },
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
        id: PROFILE_ID,
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

module.exports = router
