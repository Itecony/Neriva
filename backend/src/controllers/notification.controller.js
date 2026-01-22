const { Notification } = require('../models');

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification(s) as read
const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body; // Array of notification IDs
    const userId = req.user.id;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'notificationIds array is required' });
    }

    await Notification.update(
      { read: true },
      {
        where: {
          id: notificationIds,
          user_id: userId
        }
      }
    );

    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get mentor-application notifications (filtered for review)
const getAdminMentorNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unread_only = false } = req.query;

    const whereClause = {
      user_id: userId,
      type: 'mentor_application'
    };

    if (unread_only === 'true') {
      whereClause.read = false;
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Get admin mentor notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  getAdminMentorNotifications
};