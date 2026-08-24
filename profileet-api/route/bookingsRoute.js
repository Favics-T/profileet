const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
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
router.post('/', createBooking)
router.patch('/:id', updateBooking)
router.put('/:id', replaceBooking)
router.delete('/:id', deleteBooking)

module.exports = router
