const { prisma } = require('../config/db')

async function getClientProfile(req, res) {
  try {
    let profile = await prisma.clientProfile.findUnique({ where: { clientId: req.userId } })
    if (!profile) profile = await prisma.clientProfile.create({ data: { clientId: req.userId } })
    res.json(profile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch client profile' })
  }
}

async function updateClientProfile(req, res) {
  const { firstName, lastName, email, phone, location, bio, notifications } = req.body
  try {
    const profile = await prisma.clientProfile.upsert({
      where: { clientId: req.userId },
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
        clientId: req.userId,
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
}

module.exports = { getClientProfile, updateClientProfile }
