const express = require('express');
const router = express.Router();
const {
  getOrCreateDirectConversation,
  createGroupConversation,
  getConversations,
  getMessages,
  sendMessage
} = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');

// All routes are protected
router.post('/conversations/direct', protect, getOrCreateDirectConversation);
router.post('/conversations/group', protect, createGroupConversation);
router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId/messages', protect, getMessages);
router.post('/messages', protect, sendMessage);

module.exports = router;