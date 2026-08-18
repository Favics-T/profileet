const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const {
  listPublicReviews,
  listMyReviews,
  getMyReview,
  updateMyReview,
  deleteMyReview,
  createReview,
} = require('../controller/reviews.controller')

router.get('/artisan/:artisanId', listPublicReviews)
router.get('/', requireAuth, requireRole('artisan'), listMyReviews)
router.get('/:id', requireAuth, requireRole('artisan'), getMyReview)
router.patch('/:id', requireAuth, requireRole('artisan'), updateMyReview)
router.delete('/:id', requireAuth, requireRole('artisan'), deleteMyReview)
router.post('/:artisanId', requireAuth, requireRole('client'), createReview)

module.exports = router
