
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())          // cors allows Next.js app (different port) call this API
app.use(express.json())  // ability to read JSON request bodies

let inquiries = [
  {
    id: '1',
    client: 'Amara Obi',
    service: 'Bridal gown & 2 asoebi',
    date: 'Jun 10',
    status: 'New',
    message: 'Hi, I need a bridal gown and 2 asoebi dresses for my wedding in August. Can we discuss pricing?',
  },
  {
    id: '2',
    client: 'Funke Adeyemi',
    service: 'Corporate blazer set',
    date: 'Jun 9',
    status: 'Replied',
    message: 'I would like a corporate blazer set in navy blue. Size 12. What is your turnaround time?',
  },
  {
    id: '3',
    client: 'Chisom Eze',
    service: 'Ankara two-piece',
    date: 'Jun 8',
    status: 'Booked',
    message: 'Please I want an Ankara two-piece for a naming ceremony. I have the fabric already.',
  },
]

app.get('/api/inquiries', (req, res) => {
  res.json(inquiries)
})

app.get('/api/inquiries/:id', (req, res) => {
  const inquiry = inquiries.find((i) => i.id === req.params.id)
  if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' })
  res.json(inquiry)
})

app.patch('/api/inquiries/:id', (req, res) => {
  const inquiry = inquiries.find((i) => i.id === req.params.id)
  if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' })

  const { status } = req.body
  if (!status) return res.status(400).json({ error: 'status is required' })

  inquiry.status = status
  res.json(inquiry)
})

const PORT = 4000
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})