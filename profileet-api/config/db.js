const { PrismaClient } = require('@prisma/client')

const { Pool } = require('pg')

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'? 
  ['warn', 'query', 'error']:'error'
})

const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log(' DB Connected via Prisma')
  } catch (error) {
    console.error(' Database connection error')
    console.error(error)
    process.exit(1)
  }
}

const disconnectDB = async () => {
  await prisma.$disconnect()
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})
pool.on('error',(err)=>{
  console.error('Unexpected error on idle client', err)
})





module.exports = { prisma, connectDB, disconnectDB,pool }
