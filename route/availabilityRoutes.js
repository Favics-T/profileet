const express = require('express')
const router = express.Router()
const { requireAuth, requireArtisan } = require('../middleware/auth')
const {
  getWeekDays,
  listAvailability,
  getPublicAvailability,
  getAvailabilityByDate,
  upsertAvailability,
  deleteAvailability,
} = require('../controller/availability.controller')

router.get('/weekdays', getWeekDays)
router.get('/artisan/:artisanId', getPublicAvailability)
router.use(requireAuth, requireArtisan)
router.get('/', listAvailability)
router.get('/:date', getAvailabilityByDate)
router.post('/', upsertAvailability)
router.delete('/:date', deleteAvailability)

module.exports = router
