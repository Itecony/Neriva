const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage
} = require('../controllers/message.controller');
const { authenticateToken } = require('../middleware/auth');

// All message routes require authentication
router.get('/conversations', authenticateToken, getConversations);
router.get('/messages/:conversationId', authenticateToken, getMessages);
router.post('/messages', authenticateToken, sendMessage);

module.exports = router;
