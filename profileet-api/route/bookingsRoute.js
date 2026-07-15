const express = require('express')
const router = express.Router()
// Post method creates a new method
//put method replace an entire or existing resources
// patch method partially update 
// get method, fetch a resources
// delete method deletes a resources

let bookings = [
  {
    id: 'BK-2401', client: 'Amara Obiechina', initials: 'AO', clientColor: '#be185d',
    clientPhone: '08012345678',
    service: 'Bridal Gown', occasion: 'Wedding', deliveryDate: '2026-08-15',
    quantity: 1, urgent: false, status: 'pending', receivedAt: '2026-06-17T08:30:00',
    price: 120000, depositPaid: false, depositAmount: 60000,
    designNotes: 'A floor-length A-line bridal gown with off-shoulder neckline, floral lace overlay on the bodice, cinched waist with a satin bow at the back, and a cathedral train. I want it pure ivory white.',
    fabrics: ['Lace', 'Silk'], colors: ['#f5f5f0'],
    inspirationRef: 'https://pinterest.com/pin/example',
    measurements: { chest: '88', waist: '70', hips: '96', shoulder: '38', dressLength: '180', height: '168', weight: '62' },
    consultation: { requested: true, date: '2026-06-20', time: '11:00 AM', note: 'Want to discuss the lace pattern and train length in detail.', status: 'pending' },
  },
  {
    id: 'BK-2402', client: 'Tunde Balogun', initials: 'TB', clientColor: '#0ea5e9',
    clientPhone: '08098765432',
    service: 'Agbada Set', occasion: 'Traditional Ceremony', deliveryDate: '2026-07-20',
    quantity: 1, urgent: true, status: 'accepted', receivedAt: '2026-06-16T14:00:00',
    price: 85000, depositPaid: true, depositAmount: 42500,
    designNotes: 'Full 3-piece Agbada set — inner sokoto, inner buba, and outer agbada. Deep royal blue with gold embroidery on collar and cuffs. Wide sleeves. No cap needed.',
    fabrics: ['Aso-oke'], colors: ['#1e3a8a', '#d97706'],
    measurements: { chest: '102', waist: '88', hips: '105', shoulder: '46', height: '175', weight: '85' },
    consultation: { requested: false, status: 'none' },
  },
  {
    id: 'BK-2403', client: 'Funke Adeyemi', initials: 'FA', clientColor: '#7c3aed',
    clientPhone: '09011223344',
    service: 'Corporate Blazer Set', occasion: 'Corporate Event', deliveryDate: '2026-07-05',
    quantity: 2, urgent: false, status: 'in_progress', receivedAt: '2026-06-14T09:00:00',
    price: 55000, depositPaid: true, depositAmount: 27500,
    designNotes: 'Two matching blazer sets — one wine and one charcoal. Both slim-fit with 2 front buttons. Straight-cut trousers. Would love a subtle pinstripe on the charcoal one.',
    fabrics: ['Cotton'], colors: ['#7f1d1d', '#374151'],
    measurements: { chest: '94', waist: '76', hips: '98', shoulder: '40', sleeveLength: '60', dressLength: '100', height: '162', weight: '68' },
    consultation: { requested: true, date: '2026-06-15', time: '10:00 AM', note: '', status: 'done' },
  },
  {
    id: 'BK-2404', client: 'Chidinma Eze', initials: 'CE', clientColor: '#16a34a',
    clientPhone: '07033445566',
    service: 'Evening Gown', occasion: 'Birthday', deliveryDate: '2026-06-28',
    quantity: 1, urgent: true, status: 'completed', receivedAt: '2026-06-10T11:00:00',
    price: 75000, depositPaid: true, depositAmount: 75000,
    designNotes: 'Elegant floor-length evening gown in emerald green. Mermaid silhouette, open back, embellished neckline. Side slit at the left leg.',
    fabrics: ['Chiffon', 'Velvet'], colors: ['#065f46'],
    measurements: { chest: '84', waist: '66', hips: '92', dressLength: '175', height: '170', weight: '58' },
    consultation: { requested: false, status: 'none' },
  },
  {
    id: 'BK-2405', client: 'Emeka Nwosu', initials: 'EN', clientColor: '#d97706',
    clientPhone: '08155667788',
    service: 'Ankara Shirt (×3)', occasion: 'Everyday Wear', deliveryDate: '2026-07-10',
    quantity: 3, urgent: false, status: 'cancelled', receivedAt: '2026-06-12T16:00:00',
    price: 36000, depositPaid: false, depositAmount: 0,
    designNotes: '3 casual Ankara shirts in different prints. Short sleeves, relaxed fit.',
    fabrics: ['Ankara'], colors: [],
    measurements: { chest: '98', waist: '84', shoulder: '44', sleeveLength: '30', height: '180', weight: '80' },
    consultation: { requested: false, status: 'none' },
  },
]

const findBooking = (id) => bookings.find(b => b.id === id)

const nextId = () => {
  const nums = bookings.map(b => parseInt(b.id.replace('BK-', ''), 10)).filter(n => !isNaN(n))
  const max = nums.length ? Math.max(...nums) : 2400
  return `BK-${max + 1}`
}

const toInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')

const COLOURS = ['#be185d', '#0ea5e9', '#7c3aed', '#16a34a', '#d97706', '#0891b2', '#dc2626', '#059669']
const randomColour = () => COLOURS[Math.floor(Math.random() * COLOURS.length)]

const VALID_STATUSES = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']


router.get('/', (req, res) => {
  res.json(bookings)
})


router.get('/:id', (req, res) => {
  const booking = findBooking(req.params.id)
  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  res.json(booking)
})


router.post('/', (req, res) => {
  const { client,
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
           consultation } = req.body

  if (!client || !service || !occasion || !deliveryDate || price == null || depositAmount == null) {
    return res.status(400).json({ error: 'client, service, occasion, deliveryDate, price, and depositAmount are required' })
  }

  const newBooking = {
    id: nextId(),
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
  }

  bookings.push(newBooking)
  res.status(201).json(newBooking)
})


router.patch('/:id', (req, res) => {
  const booking = findBooking(req.params.id)
  if (!booking) return res.status(404).json({ error: 'Booking not found' })

  const { status, depositPaid, consultation, designNotes, deliveryDate, price, depositAmount, urgent, quantity, fabrics, colors, inspirationRef, measurements } = req.body

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
    booking.status = status
  }
  if (depositPaid !== undefined) booking.depositPaid = depositPaid
  if (consultation !== undefined) booking.consultation = { ...booking.consultation, ...consultation }
  if (designNotes !== undefined) booking.designNotes = designNotes
  if (deliveryDate !== undefined) booking.deliveryDate = deliveryDate
  if (price !== undefined) booking.price = Number(price)
  if (depositAmount !== undefined) booking.depositAmount = Number(depositAmount)
  if (urgent !== undefined) booking.urgent = urgent
  if (quantity !== undefined) booking.quantity = Number(quantity)
  if (fabrics !== undefined) booking.fabrics = fabrics
  if (colors !== undefined) booking.colors = colors
  if (inspirationRef !== undefined) booking.inspirationRef = inspirationRef
  if (measurements !== undefined) booking.measurements = { ...booking.measurements, ...measurements }

  res.json(booking)
})

//  PUT /bookings/:id 
// Full replace  the body becomes the new booking (id is preserved)
router.put('/:id', (req, res) => {
  const idx = bookings.findIndex(b => b.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' })

  const { client, service, occasion, deliveryDate, price, depositAmount } = req.body
  if (!client || !service || !occasion || !deliveryDate || price == null || depositAmount == null) {
    return res.status(400).json({ error: 'client, service, occasion, deliveryDate, price, and depositAmount are required for a full update' })
  }

  const updated = {
    ...req.body,
    id: req.params.id,                  
    initials: toInitials(req.body.client ?? bookings[idx].client),
    clientColor: bookings[idx].clientColor, // keep original colour
    receivedAt: bookings[idx].receivedAt,   // keep original timestamp
  }

  bookings[idx] = updated
  res.json(updated)
})


router.delete('/:id', (req, res) => {
  const idx = bookings.findIndex(b => b.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' })

  const [deleted] = bookings.splice(idx, 1)
  res.json({ message: `Booking ${deleted.id} deleted`, deleted })
})

module.exports = router