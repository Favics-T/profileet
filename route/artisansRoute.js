const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const {
  listArtisans,
  getArtisan,
  updateArtisan,
  addArtisanNote,
} = require('../controller/artisans.controller')

router.get('/', listArtisans)
router.get('/:id', getArtisan)
router.patch('/:id', requireAuth, requireRole('admin'), updateArtisan)
router.post('/:id/notes', requireAuth, requireRole('admin'), addArtisanNote)

module.exports = router
