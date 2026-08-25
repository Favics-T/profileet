const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const {
  listArtisans,
  listArtisanFilters,
  getArtisan,
  updateArtisan,
  addArtisanNote,
} = require('../controller/artisans.controller')

router.get('/', listArtisans)
router.get('/filters', listArtisanFilters)
router.get('/:id', getArtisan)
router.patch('/:id', requireAuth, requireRole('admin'), updateArtisan)
router.post('/:id/notes', requireAuth, requireRole('admin'), addArtisanNote)

module.exports = router