const express = require('express')
const router = express.Router()
const { requireAuth, requireArtisan } = require('../middleware/auth')
const {
  listInquiries,
  getInquiry,
  updateInquiry,
} = require('../controller/inquiries.controller')

router.use(requireAuth, requireArtisan)
router.get('/', listInquiries)
router.get('/:id', getInquiry)
router.patch('/:id', updateInquiry)

module.exports = router
