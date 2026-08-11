const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const designerEmail = 'adaeze@example.com'
  const clientEmail = 'ada.obi@example.com'

  const [designerUser, clientUser] = await Promise.all([
    prisma.user.findUnique({ where: { email: designerEmail } }),
    prisma.user.findUnique({ where: { email: clientEmail } }),
  ])

  if (!designerUser) {
    throw new Error(`Seed designer user not found: ${designerEmail}`)
  }

  if (!clientUser) {
    throw new Error(`Seed client user not found: ${clientEmail}`)
  }

  const result = await prisma.$transaction(async (tx) => {
    const updates = []

    updates.push(
      tx.designerProfile.updateMany({
        where: { designerId: null },
        data: { designerId: designerUser.id },
      })
    )

    updates.push(tx.booking.updateMany({
      where: { designerId: null },
      data: { designerId: designerUser.id },
    }))

    updates.push(tx.inquiry.updateMany({
      where: { designerId: null },
      data: { designerId: designerUser.id },
    }))

    updates.push(tx.availability.updateMany({
      where: { designerId: null },
      data: { designerId: designerUser.id },
    }))

    updates.push(tx.portfolioItem.updateMany({
      where: { designerId: null },
      data: { designerId: designerUser.id },
    }))

    updates.push(tx.review.updateMany({
      where: { designerId: null },
      data: { designerId: designerUser.id },
    }))

    updates.push(tx.messageConversation.updateMany({
      where: { designerId: null },
      data: { designerId: designerUser.id },
    }))

    updates.push(tx.clientProfile.updateMany({
      where: { clientId: null },
      data: { clientId: clientUser.id },
    }))

    return Promise.all(updates)
  })

  const remaining = await Promise.all([
    prisma.designerProfile.count({ where: { designerId: null } }),
    prisma.booking.count({ where: { designerId: null } }),
    prisma.inquiry.count({ where: { designerId: null } }),
    prisma.availability.count({ where: { designerId: null } }),
    prisma.portfolioItem.count({ where: { designerId: null } }),
    prisma.review.count({ where: { designerId: null } }),
    prisma.messageConversation.count({ where: { designerId: null } }),
    prisma.clientProfile.count({ where: { clientId: null } }),
  ])

  console.log('Backfill complete')
  console.log({
    designerProfileUpdated: result[0].count,
    bookingUpdated: result[1].count,
    inquiryUpdated: result[2].count,
    availabilityUpdated: result[3].count,
    portfolioItemUpdated: result[4].count,
    reviewUpdated: result[5].count,
    messageConversationUpdated: result[6].count,
    clientProfileUpdated: result[7].count,
    remainingNulls: {
      designerProfile: remaining[0],
      booking: remaining[1],
      inquiry: remaining[2],
      availability: remaining[3],
      portfolioItem: remaining[4],
      review: remaining[5],
      messageConversation: remaining[6],
      clientProfile: remaining[7],
    },
  })

  if (remaining.some((count) => count > 0)) {
    throw new Error('Backfill incomplete: some NULL ownership columns remain')
  }
}

main()
  .catch((err) => {
    console.error('Backfill failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
