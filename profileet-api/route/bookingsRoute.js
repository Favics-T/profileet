const express = require('express')
const router = express.Router()
const { prisma } = require('../config/db')

const VALID_STATUSES = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']

const toInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

const COLOURS = ['#be185d', '#0ea5e9', '#7c3aed', '#16a34a', '#d97706', '#0891b2', '#dc2626', '#059669']
const randomColour = () => COLOURS[Math.floor(Math.random() * COLOURS.length)]



router.get('/', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(bookings)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})


router.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch booking' })
  }
})

 
router.post('/', async (req, res) => {
  const {
    client,
    service,
    occasion,
    deliveryDate,
    price,
    depositAmount,
    clientPhone,
    quantity,
    urgent,
    designNotes,
    fabrics,
    colors,
    inspirationRef,
    measurements,
    consultation,
  } = req.body

  if (!client || !service || !occasion || !deliveryDate || price == null || depositAmount == null) {
    return res.status(400).json({
      error: 'client, service, occasion, deliveryDate, price, and depositAmount are required',
    })
  }

  try {
    
    const newBooking = await prisma.booking.create({
      data: {
        id,
        client,
        initials: toInitials(client),
        clientColor: randomColour(),
        clientPhone: clientPhone ?? '',
        service,
        occasion,
        deliveryDate,
        quantity: quantity ?? 1,
        urgent: urgent ?? false,
        status: 'pending',
        receivedAt: new Date().toISOString(),
        price: Number(price),
        depositPaid: false,
        depositAmount: Number(depositAmount),
        designNotes: designNotes ?? '',
        fabrics: fabrics ?? [],
        colors: colors ?? [],
        inspirationRef: inspirationRef ?? '',
        measurements: measurements ?? {},
        consultation: consultation ?? { requested: false, status: 'none' },
      },
    })
    res.status(201).json(newBooking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

router.patch('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const existing = await prisma.booking.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Booking not found' })

    const {
      status,
      depositPaid,
      consultation,
      designNotes,
      deliveryDate,
      price,
      depositAmount,
      urgent,
      quantity,
      fabrics,
      colors,
      inspirationRef,
      measurements,
    } = req.body

    
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(depositPaid !== undefined && { depositPaid }),
        ...(consultation !== undefined && {
          consultation: { ...(existing.consultation ?? {}), ...consultation },
        }),
        ...(designNotes !== undefined && { designNotes }),
        ...(deliveryDate !== undefined && { deliveryDate }),
        ...(price !== undefined && { price: Number(price) }),
        ...(depositAmount !== undefined && { depositAmount: Number(depositAmount) }),
        ...(urgent !== undefined && { urgent }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(fabrics !== undefined && { fabrics }),
        ...(colors !== undefined && { colors }),
        ...(inspirationRef !== undefined && { inspirationRef }),
        ...(measurements !== undefined && {
          measurements: { ...(existing.measurements ?? {}), ...measurements },
        }),
      },
    })

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update booking' })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { client, service, occasion, deliveryDate, price, depositAmount } = req.body

  if (!client || !service || !occasion || !deliveryDate || price == null || depositAmount == null) {
    return res.status(400).json({
      error: 'client, service, occasion, deliveryDate, price, and depositAmount are required for a full update',
    })
  }

  try {
    const existing = await prisma.booking.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Booking not found' })

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...req.body,
        id,                                     
        initials: toInitials(req.body.client ?? existing.client),
        clientColor: existing.clientColor,      
        receivedAt: existing.receivedAt,        
      },
    })

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to replace booking' })
  }
})


router.delete('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    const deleted = await prisma.booking.delete({ where: { id: req.params.id } })
    res.json({ message: `Booking ${deleted.id} deleted`, deleted })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete booking' })
  }
})

module.exports = router