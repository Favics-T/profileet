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

  const result = await prisma.$transaction([
    prisma.$executeRawUnsafe(`UPDATE "DesignerProfile" SET "designerId" = $1 WHERE "designerId" IS NULL`, designerUser.id),
    prisma.$executeRawUnsafe(`UPDATE "Booking" SET "designerId" = $1 WHERE "designerId" IS NULL`, designerUser.id),
    prisma.$executeRawUnsafe(`UPDATE "Inquiry" SET "designerId" = $1 WHERE "designerId" IS NULL`, designerUser.id),
    prisma.$executeRawUnsafe(`UPDATE "Availability" SET "designerId" = $1 WHERE "designerId" IS NULL`, designerUser.id),
    prisma.$executeRawUnsafe(`UPDATE "PortfolioItem" SET "designerId" = $1 WHERE "designerId" IS NULL`, designerUser.id),
    prisma.$executeRawUnsafe(`UPDATE "Review" SET "designerId" = $1 WHERE "designerId" IS NULL`, designerUser.id),
    prisma.$executeRawUnsafe(`UPDATE "MessageConversation" SET "designerId" = $1 WHERE "designerId" IS NULL`, designerUser.id),
    prisma.$executeRawUnsafe(`UPDATE "ClientProfile" SET "clientId" = $1 WHERE "clientId" IS NULL`, clientUser.id),
  ])

  const remaining = await Promise.all([
    prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "DesignerProfile" WHERE "designerId" IS NULL`),
    prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "Booking" WHERE "designerId" IS NULL`),
    prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "Inquiry" WHERE "designerId" IS NULL`),
    prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "Availability" WHERE "designerId" IS NULL`),
    prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "PortfolioItem" WHERE "designerId" IS NULL`),
    prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "Review" WHERE "designerId" IS NULL`),
    prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "MessageConversation" WHERE "designerId" IS NULL`),
    prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "ClientProfile" WHERE "clientId" IS NULL`),
  ])

  console.log('Backfill complete')
    console.log({
    designerProfileUpdated: result[0],
    bookingUpdated: result[1],
    inquiryUpdated: result[2],
    availabilityUpdated: result[3],
    portfolioItemUpdated: result[4],
    reviewUpdated: result[5],
    messageConversationUpdated: result[6],
    clientProfileUpdated: result[7],
    remainingNulls: {
      designerProfile: remaining[0][0].count,
      booking: remaining[1][0].count,
      inquiry: remaining[2][0].count,
      availability: remaining[3][0].count,
      portfolioItem: remaining[4][0].count,
      review: remaining[5][0].count,
      messageConversation: remaining[6][0].count,
      clientProfile: remaining[7][0].count,
    },
  })

  if (remaining.some((rows) => rows[0].count > 0)) {
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
