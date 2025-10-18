const express = require('express');
const router = express.Router();
const {
  getOrCreateDirectConversation,
  createGroupConversation,
  getConversations,
  getMessages,
  sendMessage
} = require('../controllers/message.controller');
const { authenticateToken } = require('../middleware/auth');  // ← Changed

// All routes are protected
router.get('/conversations', authenticateToken, getConversations);
router.post('/conversations/direct', authenticateToken, getOrCreateDirectConversation);
router.post('/conversations/group', authenticateToken, createGroupConversation);
router.get('/messages/:conversationId', authenticateToken, getMessages);
router.post('/messages', authenticateToken, sendMessage);

module.exports = router;