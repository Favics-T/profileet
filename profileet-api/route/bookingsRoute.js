const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const {
  listBookings,
  getBooking,
  createBooking,
  updateBooking,
  replaceBooking,
  deleteBooking,
} = require('../controller/bookings.controller')

router.use(requireAuth)
router.get('/', listBookings)
router.get('/:id', getBooking)
router.post('/', requireRole('client'), createBooking)
router.patch('/:id', updateBooking)
router.put('/:id', requireRole('client'), replaceBooking)
router.delete('/:id', deleteBooking)

module.exports = router
