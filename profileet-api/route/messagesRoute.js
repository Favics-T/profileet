const express = require('express')
const router = express.Router()
const { requireAuth, requireArtisan } = require('../middleware/auth')
const {
  listConversations,
  markConversationRead,
  sendMessage,
} = require('../controller/messages.controller')

router.use(requireAuth, requireArtisan)
router.get('/', listConversations)
router.patch('/:id/read', markConversationRead)
router.post('/:id/messages', sendMessage)

module.exports = router
