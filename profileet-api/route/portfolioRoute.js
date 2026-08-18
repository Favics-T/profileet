const express = require('express')
const router = express.Router()
const { requireAuth, requireArtisan } = require('../middleware/auth')
const {
  listPortfolioItems,
  getPortfolioItem,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} = require('../controller/portfolio.controller')

router.use(requireAuth, requireArtisan)
router.get('/', listPortfolioItems)
router.get('/:id', getPortfolioItem)
router.post('/', createPortfolioItem)
router.patch('/:id', updatePortfolioItem)
router.delete('/:id', deletePortfolioItem)

module.exports = router
