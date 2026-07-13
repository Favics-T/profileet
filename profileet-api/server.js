// import inquiriesRoute from './route/inquiriesRoute'
const inquiriesRoute = require('./route/inquiriesRoute')
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())          // cors allows Next.js app (different port) call this API
app.use(express.json())  // ability to read JSON request bodies

app.use('/inquiries', inquiriesRoute)


const PORT = 4000
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})