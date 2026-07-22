const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const express = require('express')
const cors = require('cors')
const { connectDB, disconnectDB } = require('./config/db')

// routes
const inquiriesRoute     = require('./route/inquiriesRoute')
const bookingsRoute      = require('./route/bookingsRoute')
const availabilityRoutes = require('./route/availabilityRoutes')
const profileRoute       = require('./route/profileRoute')

const app = express()

app.use(cors())          // cors allows Next.js app (different port) to call this API
app.use(express.json())  // ability to read JSON request bodies

// routes 
app.use('/inquiries',   inquiriesRoute)
app.use('/bookings',    bookingsRoute)
app.use('/availability', availabilityRoutes)
app.use('/profile',     profileRoute)

//  handlled chrome dev tools error
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end()
})

// checking if the server health is okay
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server after DB connects 
const PORT = process.env.PORT || 4000

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UnhandledRejection:', err)
    server.close(() => {
      process.exit(1)
    })
  })

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully')
    server.close(async () => {
      await disconnectDB()
      console.log('Process terminated')
      process.exit(0)
    })
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err)
  process.exit(1)
})