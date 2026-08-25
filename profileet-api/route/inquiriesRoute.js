const express = require('express')
const router = express.Router()
const { requireAuth, requireArtisan, requireRole } = require('../middleware/auth')
const {
  listInquiries,
  getInquiry,
  updateInquiry,
  createInquiry,
} = require('../controller/inquiries.controller')

router.post('/', requireAuth, requireRole('client'), createInquiry)
router.get('/', requireAuth, requireArtisan, listInquiries)
router.get('/:id', requireAuth, requireArtisan, getInquiry)
router.patch('/:id', requireAuth, requireArtisan, updateInquiry)

module.exports = router
