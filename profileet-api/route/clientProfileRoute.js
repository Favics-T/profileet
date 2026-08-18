const express = require('express')
const router = express.Router()
const { requireAuth, requireClient } = require('../middleware/auth')
const { getClientProfile, updateClientProfile } = require('../controller/clientProfile.controller')

router.use(requireAuth, requireClient)
router.get('/', getClientProfile)
router.patch('/', updateClientProfile)

module.exports = router
