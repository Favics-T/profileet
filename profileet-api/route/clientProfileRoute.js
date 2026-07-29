const express = require('express')
const router = express.Router()
const { prisma } = require('../config/db')

router.get('/', async (req, res) => {
  try {
    let profile = await prisma.clientProfile.findUnique({ where: { id: 1 } })
    if (!profile) {
      profile = await prisma.clientProfile.create({
        data: { id: 1 },
      })
    }
    res.json(profile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch client profile' })
  }
})

router.patch('/', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    location,
    bio,
    notifications,
  } = req.body

  try {
    const profile = await prisma.clientProfile.upsert({
      where: { id: 1 },
      update: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(bio !== undefined && { bio }),
        ...(notifications?.bookingUpdates !== undefined && { bookingUpdates: notifications.bookingUpdates }),
        ...(notifications?.newMessages !== undefined && { newMessages: notifications.newMessages }),
        ...(notifications?.promotions !== undefined && { promotions: notifications.promotions }),
        ...(notifications?.reminders !== undefined && { reminders: notifications.reminders }),
      },
      create: {
        id: 1,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        email: email ?? '',
        phone: phone ?? '',
        location: location ?? '',
        bio: bio ?? '',
        bookingUpdates: notifications?.bookingUpdates ?? true,
        newMessages: notifications?.newMessages ?? true,
        promotions: notifications?.promotions ?? false,
        reminders: notifications?.reminders ?? true,
      },
    })

    res.json(profile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update client profile' })
  }
})

module.exports = router
