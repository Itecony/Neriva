const { 
  ResourceBookmark, 
  ResourceCompletion, 
  ResourceReview,
  Resource,
  User 
} = require('../models');
const { Op } = require('sequelize');

/**
 * Get user's learning dashboard
 * GET /api/users/learning-dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get bookmarked resources
    const bookmarkedCount = await ResourceBookmark.count({
      where: { user_id: userId }
    });

    // Get in-progress resources
    const inProgressCount = await ResourceBookmark.count({
      where: { 
        user_id: userId,
        status: 'in_progress'
      }
    });

    // Get completed resources
    const completedCount = await ResourceBookmark.count({
      where: { 
        user_id: userId,
        status: 'completed'
      }
    });

    // Calculate completion rate
    const completionRate = bookmarkedCount > 0
      ? ((completedCount / bookmarkedCount) * 100).toFixed(2)
      : 0;

    // Get total learning hours (sum of estimated times for completed resources)
    const completedBookmarks = await ResourceBookmark.findAll({
      where: { 
        user_id: userId,
        status: 'completed'
      },
      include: [
        {
          model: Resource,
          as: 'resource',
          attributes: ['estimated_time_minutes']
        }
      ]
    });

    const totalMinutes = completedBookmarks.reduce((sum, bookmark) => {
      return sum + (bookmark.resource ? bookmark.resource.estimated_time_minutes : 0);
    }, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Get recent bookmarks
    const recentBookmarks = await ResourceBookmark.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Resource,
          as: 'resource',
          include: [
            {
              model: User,
              as: 'mentor',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }
      ],
      order: [['bookmarked_at', 'DESC']],
      limit: 5
    });

    // Get recently completed
    const recentlyCompleted = await ResourceBookmark.findAll({
      where: { 
        user_id: userId,
        status: 'completed'
      },
      include: [
        {
          model: Resource,
          as: 'resource',
          include: [
            {
              model: User,
              as: 'mentor',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }
      ],
      order: [['completed_at', 'DESC']],
      limit: 5
    });

    // Get domains explored (from bookmarked resources)
    const bookmarksWithResources = await ResourceBookmark.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Resource,
          as: 'resource',
          attributes: ['domain']
        }
      ]
    });

    const domains = [...new Set(bookmarksWithResources.map(b => b.resource?.domain).filter(Boolean))];

    return res.status(200).json({
      success: true,
      data: {
        statistics: {
          total_bookmarks: bookmarkedCount,
          in_progress: inProgressCount,
          completed: completedCount,
          completion_rate: parseFloat(completionRate),
          total_learning_hours: parseFloat(totalHours),
          domains_explored: domains.length
        },
        domains_explored: domains,
        recent_bookmarks: recentBookmarks,
        recently_completed: recentlyCompleted
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching learning dashboard',
      error: error.message
    });
  }
};

/**
 * Get user's bookmarked resources
 * GET /api/users/bookmarks?status=in_progress
 */
const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: userId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: bookmarks } = await ResourceBookmark.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Resource,
          as: 'resource',
          include: [
            {
              model: User,
              as: 'mentor',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        }
      ],
      order: [['bookmarked_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: bookmarks,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get bookmarks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching bookmarks',
      error: error.message
    });
  }
};

/**
 * Get user's completed resources
 * GET /api/users/completed
 */
const getCompletedResources = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: completions } = await ResourceCompletion.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Resource,
          as: 'resource',
          include: [
            {
              model: User,
              as: 'mentor',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        }
      ],
      order: [['completed_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: completions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get completed resources error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching completed resources',
      error: error.message
    });
  }
};

/**
 * Get user's reviews
 * GET /api/users/reviews
 */
const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await ResourceReview.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Resource,
          as: 'resource',
          include: [
            {
              model: User,
              as: 'mentor',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get my reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

module.exports = {
  getDashboard,
  getBookmarks,
  getCompletedResources,
  getMyReviews
};