const express = require('express')
const router = express.Router()
const { requireAuth, requireArtisan } = require('../middleware/auth')
const {
  getArtisanProfile,
  updateArtisanProfile,
  getArtisanAvailability,
  getArtisanPricing,
  updateArtisanPricing,
} = require('../controller/profile.controller')

router.use(requireAuth, requireArtisan)
router.get('/', getArtisanProfile)
router.patch('/', updateArtisanProfile)
router.get('/:artisanId/availability', getArtisanAvailability)
router.get('/pricing', getArtisanPricing)
router.get('/:artisanId/pricing', getArtisanPricing)
router.patch('/pricing', updateArtisanPricing)

module.exports = router
