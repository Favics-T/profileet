const express = require('express')
const router = express.Router()
const { requireAuth, requireArtisan } = require('../middleware/auth')
const {
  getArtisanProfile,
  updateArtisanProfile,
  getArtisanAvailability,
} = require('../controller/profile.controller')

router.use(requireAuth, requireArtisan)
router.get('/', getArtisanProfile)
router.patch('/', updateArtisanProfile)
router.get('/:artisanId/availability', getArtisanAvailability)

module.exports = router
