const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead
} = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth');

// All notification routes require authentication
router.get('/notifications', authenticateToken, getNotifications);
router.post('/notifications/mark-read', authenticateToken, markAsRead);

module.exports = router;