const { Resource, User, MentorProfile, ResourceBookmark, ResourceReview } = require('../models');
const { Op } = require('sequelize');

/**
 * Create resource (mentor only)
 * POST /api/resources
 */
const createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      resource_type,
      url,
      file_path,
      file_size,
      domain,
      difficulty_level,
      estimated_time_minutes,
      prerequisites,
      learning_outcomes,
      tags
    } = req.body;
    const mentorId = req.user.id;

    // Validation
    if (!title || !description || !resource_type || !domain || !difficulty_level || !estimated_time_minutes || !learning_outcomes || !tags) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate title length
    if (title.length < 5 || title.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Title must be between 5 and 255 characters'
      });
    }

    // Validate description length
    if (description.length < 100 || description.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be between 100 and 5000 characters'
      });
    }

    // Validate tags
    if (!Array.isArray(tags) || tags.length < 3 || tags.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Must have between 3 and 10 tags'
      });
    }

    // Must have either URL or file_path
    if (!url && !file_path) {
      return res.status(400).json({
        success: false,
        message: 'Resource must have either a URL or file path'
      });
    }

    // Videos must be links only
    if (resource_type === 'video' && !url) {
      return res.status(400).json({
        success: false,
        message: 'Video resources must be links (URL required)'
      });
    }
    if (resource_type === 'video' && file_path) {
      return res.status(400).json({
        success: false,
        message: 'Video resources cannot be uploaded files, must be links only'
      });
    }

    // PDF size limit (50MB = 52428800 bytes)
    if (resource_type === 'pdf' && file_size && file_size > 52428800) {
      return res.status(400).json({
        success: false,
        message: 'PDF files must be 50MB or less'
      });
    }

    // Create resource
    const resource = await Resource.create({
      mentor_id: mentorId,
      title,
      description,
      resource_type,
      url,
      file_path,
      file_size,
      domain,
      difficulty_level,
      estimated_time_minutes,
      prerequisites,
      learning_outcomes,
      tags
    });

    // Update mentor profile resource count
    const mentorProfile = await MentorProfile.findOne({
      where: { user_id: mentorId }
    });

    if (mentorProfile) {
      mentorProfile.total_resources_created += 1;
      await mentorProfile.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating resource',
      error: error.message
    });
  }
};

/**
 * Get all resources
 * GET /api/resources?domain=Web Development&difficulty_level=intermediate&page=1&limit=10
 */
const getAllResources = async (req, res) => {
  try {
    const {
      domain,
      difficulty_level,
      resource_type,
      page = 1,
      limit = 20,
      sort_by = 'recent'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (domain) {
      whereClause.domain = domain;
    }

    if (difficulty_level) {
      whereClause.difficulty_level = difficulty_level;
    }

    if (resource_type) {
      whereClause.resource_type = resource_type;
    }

    // Determine sort order
    let order = [];
    if (sort_by === 'rating') {
      order = [['average_rating', 'DESC']];
    } else if (sort_by === 'popular') {
      order = [['bookmark_count', 'DESC']];
    } else if (sort_by === 'views') {
      order = [['view_count', 'DESC']];
    } else {
      order = [['created_at', 'DESC']];
    }

    const { count, rows: resources } = await Resource.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'mentor',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order,
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
    console.error('Get all resources error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching resources',
      error: error.message
    });
  }
};

/**
 * Search resources
 * GET /api/resources/search?q=react hooks&domain=Web Development
 */
const searchResources = async (req, res) => {
  try {
    const { q, domain, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required'
      });
    }

    const whereClause = {
      [Op.or]: [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { tags: { [Op.contains]: [q] } }
      ]
    };

    if (domain) {
      whereClause.domain = domain;
    }

    const { count, rows: resources } = await Resource.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'mentor',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['average_rating', 'DESC']],
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
    console.error('Search resources error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching resources',
      error: error.message
    });
  }
};

/**
 * Get featured resources
 * GET /api/resources/featured
 */
const getFeaturedResources = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const resources = await Resource.findAll({
      where: { is_featured: true },
      include: [
        {
          model: User,
          as: 'mentor',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['featured_at', 'DESC']],
      limit: parseInt(limit)
    });

    return res.status(200).json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Get featured resources error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching featured resources',
      error: error.message
    });
  }
};

/**
 * Get trending resources (most bookmarked in last 7 days)
 * GET /api/resources/trending
 */
const getTrendingResources = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const resources = await Resource.findAll({
      where: {
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      },
      include: [
        {
          model: User,
          as: 'mentor',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [
        ['bookmark_count', 'DESC'],
        ['view_count', 'DESC']
      ],
      limit: parseInt(limit)
    });

    return res.status(200).json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Get trending resources error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching trending resources',
      error: error.message
    });
  }
};

/**
 * Get specific resource
 * GET /api/resources/:id
 */
const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id, {
      include: [
        {
          model: User,
          as: 'mentor',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture'],
          include: [
            {
              model: MentorProfile,
              as: 'mentorProfile',
              attributes: ['bio', 'expertise_domains', 'average_resource_rating']
            }
          ]
        }
      ]
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment view count
    resource.view_count += 1;
    await resource.save();

    // Update mentor's total views
    const mentorProfile = await MentorProfile.findOne({
      where: { user_id: resource.mentor_id }
    });

    if (mentorProfile) {
      mentorProfile.total_views_received += 1;
      await mentorProfile.save();
    }

    return res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Get resource by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching resource',
      error: error.message
    });
  }
};

/**
 * Update resource
 * PUT /api/resources/:id
 */
const updateResource = async (req, res) => {
  try {
    const resource = req.resource; // Assumed to be fetched by middleware

    const {
      title,
      description,
      url,
      difficulty_level,
      estimated_time_minutes,
      prerequisites,
      learning_outcomes,
      tags
    } = req.body;

    // Update fields if provided
    if (title) {
      if (title.length < 5 || title.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Title must be between 5 and 255 characters'
        });
      }
      resource.title = title;
    }

    if (description) {
      if (description.length < 100 || description.length > 5000) {
        return res.status(400).json({
          success: false,
          message: 'Description must be between 100 and 5000 characters'
        });
      }
      resource.description = description;
    }

    if (url !== undefined) resource.url = url;
    if (difficulty_level) resource.difficulty_level = difficulty_level;
    if (estimated_time_minutes) resource.estimated_time_minutes = estimated_time_minutes;
    if (prerequisites !== undefined) resource.prerequisites = prerequisites;
    if (learning_outcomes) resource.learning_outcomes = learning_outcomes;

    if (tags) {
      if (!Array.isArray(tags) || tags.length < 3 || tags.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Must have between 3 and 10 tags'
        });
      }
      resource.tags = tags;
    }

    await resource.save();

    return res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating resource',
      error: error.message
    });
  }
};

/**
 * Delete resource
 * DELETE /api/resources/:id
 */
const deleteResource = async (req, res) => {
  try {
    const resource = req.resource; // Assumed to be fetched by middleware

    // Update mentor profile resource count
    const mentorProfile = await MentorProfile.findOne({
      where: { user_id: resource.mentor_id }
    });

    if (mentorProfile && mentorProfile.total_resources_created > 0) {
      mentorProfile.total_resources_created -= 1;
      await mentorProfile.save();
    }

    await resource.destroy();

    return res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting resource',
      error: error.message
    });
  }
};

module.exports = {
  createResource,
  getAllResources,
  searchResources,
  getFeaturedResources,
  getTrendingResources,
  getResourceById,
  updateResource,
  deleteResource
};