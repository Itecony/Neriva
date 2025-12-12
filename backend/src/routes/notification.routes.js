const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  getAdminMentorNotifications
} = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/mentor.middleware');

// All notification routes require authentication
router.get('/notifications', authenticateToken, getNotifications);
router.post('/notifications/mark-read', authenticateToken, markAsRead);

// Admin: Get mentor-application notifications for review
router.get('/admin/notifications/mentor-applications', authenticateToken, isAdmin, getAdminMentorNotifications);

module.exports = router;