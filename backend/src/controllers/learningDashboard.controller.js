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
    let bookmarkedCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;
    let completionRate = 0;
    let totalHours = 0;
    let recentBookmarks = [];
    let recentlyCompleted = [];
    let domains = [];

    // 1. Get stats counts
    try {
      bookmarkedCount = await ResourceBookmark.count({ where: { user_id: userId } });
      inProgressCount = await ResourceBookmark.count({ where: { user_id: userId, status: 'in_progress' } });
      completedCount = await ResourceBookmark.count({ where: { user_id: userId, status: 'completed' } });

      completionRate = bookmarkedCount > 0
        ? ((completedCount / bookmarkedCount) * 100).toFixed(2)
        : 0;
    } catch (e) {
      console.error("Stats Count Error", e);
      throw new Error(`Stats Error: ${e.message}`);
    }

    // 2. Get total hours
    try {
      const completedBookmarks = await ResourceBookmark.findAll({
        where: { user_id: userId, status: 'completed' },
        include: [{
          model: Resource,
          as: 'resource',
          attributes: ['estimated_time_minutes']
        }]
      });

      const totalMinutes = completedBookmarks.reduce((sum, bookmark) => {
        return sum + (bookmark.resource ? bookmark.resource.estimated_time_minutes : 0);
      }, 0);
      totalHours = (totalMinutes / 60).toFixed(1);
    } catch (e) {
      console.error("Hours Calc Error", e);
      throw new Error(`Hours Error: ${e.message}`);
    }

    // 3. Get recent bookmarks
    try {
      recentBookmarks = await ResourceBookmark.findAll({
        where: { user_id: userId },
        include: [{
          model: Resource,
          as: 'resource',
          include: [{
            model: User,
            as: 'mentor',
            attributes: ['id', 'firstName', 'lastName']
          }]
        }],
        order: [['bookmarked_at', 'DESC']],
        limit: 5
      });
    } catch (e) {
      console.error("Recent Bookmarks Error", e);
      throw new Error(`Bookmarks Error: ${e.message}`);
    }

    // 4. Get recently completed
    try {
      recentlyCompleted = await ResourceBookmark.findAll({
        where: { user_id: userId, status: 'completed' },
        include: [{
          model: Resource,
          as: 'resource',
          include: [{
            model: User,
            as: 'mentor',
            attributes: ['id', 'firstName', 'lastName']
          }]
        }],
        order: [['completed_at', 'DESC']],
        limit: 5
      });
    } catch (e) {
      console.error("Completed Error", e);
      throw new Error(`Completed Error: ${e.message}`);
    }

    // 5. Get domains
    try {
      const bookmarksWithResources = await ResourceBookmark.findAll({
        where: { user_id: userId },
        include: [{
          model: Resource,
          as: 'resource',
          attributes: ['domain']
        }]
      });
      domains = [...new Set(bookmarksWithResources.map(b => b.resource?.domain).filter(Boolean))];
    } catch (e) {
      console.error("Domains Error", e);
      throw new Error(`Domains Error: ${e.message}`);
    }

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
      message: error.message,
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