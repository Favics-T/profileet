const inquiriesRoute = require('./route/inquiriesRoute')
const bookingsRoute = require('./route/bookingsRoute')
const availabilityRoutes = require('./route/availabilityRoutes')
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())          // cors allows Next.js app (different port) call this API
app.use(express.json())  // ability to read JSON request bodies

app.use('/inquiries', inquiriesRoute)
app.use('/bookings', bookingsRoute)
app.use('/availability', availabilityRoutes)

const PORT = 4000
const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})























































const { config } = require('dotenv')
config()
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UnhandledRejection:', err)
  server.close(() => {
    process.exit(1)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err)
  process.exit(1)
})

// Graceful ShutDown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
    process.exit(0)
  })
})




















































































app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end()
})