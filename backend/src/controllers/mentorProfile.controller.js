const { User, MentorProfile, Resource, ResourceReview } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all mentors
 * GET /api/mentors?domain=Web Development&open_to_mentorship=true
 */
const getAllMentors = async (req, res) => {
  try {
    const { domain, open_to_mentorship, page = 1, limit = 20, sort_by = 'rating' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (open_to_mentorship) {
      whereClause.open_to_mentorship = open_to_mentorship === 'true';
    }

    if (domain) {
      whereClause.expertise_domains = {
        [Op.contains]: [domain]
      };
    }

    // Determine sort order
    let order = [];
    if (sort_by === 'rating') {
      order = [['average_resource_rating', 'DESC NULLS LAST']];
    } else if (sort_by === 'resources') {
      order = [['total_resources_created', 'DESC']];
    } else if (sort_by === 'recent') {
      order = [['verified_at', 'DESC']];
    }

    const { count, rows: mentorProfiles } = await MentorProfile.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'profilePicture', 'bio']
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: mentorProfiles,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get all mentors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching mentors',
      error: error.message
    });
  }
};

/**
 * Get specific mentor by ID
 * GET /api/mentors/:id
 */
const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mentor ID format. Expected a valid UUID.'
      });
    }

    const user = await User.findByPk(id, {
      include: [
        {
          model: MentorProfile,
          as: 'mentorProfile'
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.is_mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get mentor by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching mentor',
      error: error.message
    });
  }
};

/**
 * Update my mentor profile
 * PUT /api/mentors/profile
 */
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, teaching_style, open_to_mentorship, mentorship_description } = req.body;

    const mentorProfile = await MentorProfile.findOne({
      where: { user_id: userId }
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    // Validate field lengths
    if (bio && bio.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Bio must be 1000 characters or less'
      });
    }

    if (teaching_style && teaching_style.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Teaching style must be 500 characters or less'
      });
    }

    if (mentorship_description && mentorship_description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Mentorship description must be 500 characters or less'
      });
    }

    // Update fields
    if (bio !== undefined) mentorProfile.bio = bio;
    if (teaching_style !== undefined) mentorProfile.teaching_style = teaching_style;
    if (open_to_mentorship !== undefined) mentorProfile.open_to_mentorship = open_to_mentorship;
    if (mentorship_description !== undefined) mentorProfile.mentorship_description = mentorship_description;

    await mentorProfile.save();

    return res.status(200).json({
      success: true,
      message: 'Mentor profile updated successfully',
      data: mentorProfile
    });

  } catch (error) {
    console.error('Update mentor profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating mentor profile',
      error: error.message
    });
  }
};

/**
 * Get mentor's resources
 * GET /api/mentors/:id/resources
 */
const getMentorResources = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mentor ID format. Expected a valid UUID.'
      });
    }

    // Verify mentor exists
    const user = await User.findByPk(id);
    if (!user || !user.is_mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    const { count, rows: resources } = await Resource.findAndCountAll({
      where: { mentor_id: id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: resources,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get mentor resources error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching mentor resources',
      error: error.message
    });
  }
};

/**
 * Get mentor statistics
 * GET /api/mentors/:id/stats
 */
const getMentorStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mentor ID format. Expected a valid UUID.'
      });
    }

    const mentorProfile = await MentorProfile.findOne({
      where: { user_id: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        total_resources: mentorProfile.total_resources_created,
        total_views: mentorProfile.total_views_received,
        total_bookmarks: mentorProfile.total_bookmarks_received,
        total_completions: mentorProfile.total_completions_received,
        average_rating: mentorProfile.average_resource_rating,
        expertise_domains: mentorProfile.expertise_domains,
        verified_since: mentorProfile.verified_at
      }
    });

  } catch (error) {
    console.error('Get mentor stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching mentor statistics',
      error: error.message
    });
  }
};

/**
 * Get my mentor analytics
 * GET /api/mentors/analytics
 */
const getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const mentorProfile = await MentorProfile.findOne({
      where: { user_id: userId }
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    // Get resources with details
    const resources = await Resource.findAll({
      where: { mentor_id: userId },
      attributes: [
        'id', 'title', 'view_count', 'bookmark_count', 
        'completion_count', 'average_rating', 'total_ratings'
      ],
      order: [['view_count', 'DESC']]
    });

    // Calculate analytics
    const totalViews = resources.reduce((sum, r) => sum + r.view_count, 0);
    const totalBookmarks = resources.reduce((sum, r) => sum + r.bookmark_count, 0);
    const totalCompletions = resources.reduce((sum, r) => sum + r.completion_count, 0);
    
    const mostPopular = resources.length > 0 ? resources[0] : null;

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          total_resources: mentorProfile.total_resources_created,
          resources_remaining: 10 - mentorProfile.total_resources_created,
          average_rating: mentorProfile.average_resource_rating,
          total_views: totalViews,
          total_bookmarks: totalBookmarks,
          total_completions: totalCompletions
        },
        most_popular_resource: mostPopular,
        all_resources: resources
      }
    });

  } catch (error) {
    console.error('Get mentor analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching mentor analytics',
      error: error.message
    });
  }
};

module.exports = {
  getAllMentors,
  getMentorById,
  updateMyProfile,
  getMentorResources,
  getMentorStats,
  getMyAnalytics
};