const { PrismaClient } = require('@prisma/client')



const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'? 
  ['warn', 'query', 'error']:'error'
})

const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log(' DB Connected via Prisma')
  } catch (error) {
    console.error(` Database connection error: ${error.message}`)
    process.exit(1)
  }
}

const disconnectDB = async () => {
  await prisma.$disconnect()
}



module.exports = { prisma, connectDB, disconnectDB }
