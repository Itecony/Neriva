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

module.exports = {
  getNotifications,
  markAsRead
};