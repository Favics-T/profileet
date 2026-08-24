const express = require('express')
const router = express.Router()
const { requireAuth, requireArtisan } = require('../middleware/auth')
const { createProfileView, getProfileViewStats } = require('../controller/profileViews.controller')

router.post('/', createProfileView)
router.get('/stats', requireAuth, requireArtisan, getProfileViewStats)

module.exports = router
