const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./docs/openapi')
const { connectDB, disconnectDB } = require('./config/db')
const { generalLimiter } = require('./middleware/rateLimiter')


// routes
const inquiriesRoute     = require('./route/inquiriesRoute')
const bookingsRoute      = require('./route/bookingsRoute')
const availabilityRoutes = require('./route/availabilityRoutes')
const profileRoute       = require('./route/profileRoute')
const profileViewsRoute  = require('./route/profileViewsRoute')
const reviewsRoute       = require('./route/reviewsRoute')
const portfolioRoute     = require('./route/portfolioRoute')
const designersRoute     = require('./route/designersRoute')
const messagesRoute      = require('./route/messagesRoute')
const clientProfileRoute  = require('./route/clientProfileRoute')
const authRoutes         = require('./route/authRoutes')

const app = express()

app.use(cors({ origin: 'http://localhost:3000' }))          
app.use(express.json())  
app.use(generalLimiter)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// routes 
app.use('/inquiries',      inquiriesRoute)
app.use('/bookings',       bookingsRoute)
app.use('/availability',   availabilityRoutes)
app.use('/profile',        profileRoute)
app.use('/profile/views',  profileViewsRoute)
app.use('/reviews',        reviewsRoute)
app.use('/portfolio',      portfolioRoute)
app.use('/designers',      designersRoute)
app.use('/messages',       messagesRoute)
app.use('/client/profile', clientProfileRoute)
app.use('/auth',           authRoutes)

//  handlled chrome dev tools error
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end()
})


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

 
const PORT = process.env.PORT || 5000

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(` API running on http://localhost:${PORT}`)
    console.log(` Swagger docs on http://localhost:${PORT}/api-docs`)
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

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully')
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
