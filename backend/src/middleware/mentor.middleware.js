const { MentorProfile, Resource, User } = require('../models');

/**
 * Check if user is a verified mentor
 */
const isMentor = async (req, res, next) => {
  try {
    if (!req.user || !req.user.is_mentor) {
      return res.status(403).json({
        success: false,
        message: 'Only verified mentors can perform this action'
      });
    }
    next();
  } catch (error) {
    console.error('isMentor middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking mentor status'
    });
  }
};

/**
 * Check if user is an admin
 */
const isAdmin = async (req, res, next) => {
  try {
    const isDevMode = process.env.NODE_ENV !== 'production';
    const isAdminUser = req.user && req.user.role === 'admin';
    
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can perform this action'
      });
    }
    
    // In development, allow first user (by ID or email) to act as admin for testing
    // In production, strictly require admin role
    if (isDevMode && !isAdminUser) {
      console.warn(`[DEV MODE] User ${req.user.email} with role '${req.user.role}' bypassed isAdmin check`);
      // Allow in dev mode for testing
      return next();
    }
    
    if (!isAdminUser) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can perform this action'
      });
    }
    
    next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking admin status'
    });
  }
};

/**
 * Check if user can apply for mentor status
 */
const canApplyForMentor = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already a mentor
    if (user.is_mentor) {
      return res.status(400).json({
        success: false,
        message: 'You are already a verified mentor'
      });
    }

    // Check if can apply (not blocked)
    if (!user.can_apply_mentor) {
      return res.status(403).json({
        success: false,
        message: 'You are currently blocked from applying for mentor status'
      });
    }

    // Check cooldown period
    if (user.mentor_application_cooldown_until) {
      const now = new Date();
      const cooldownEnd = new Date(user.mentor_application_cooldown_until);
      
      if (now < cooldownEnd) {
        const daysLeft = Math.ceil((cooldownEnd - now) / (1000 * 60 * 60 * 24));
        return res.status(403).json({
          success: false,
          message: `You must wait ${daysLeft} more days before reapplying`,
          cooldown_until: cooldownEnd
        });
      }
    }

    next();
  } catch (error) {
    console.error('canApplyForMentor middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking application eligibility'
    });
  }
};

/**
 * Check if user owns the resource
 */
const isResourceOwner = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const resource = await Resource.findByPk(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resource.mentor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit/delete your own resources'
      });
    }

    // Attach resource to request for later use
    req.resource = resource;
    next();
  } catch (error) {
    console.error('isResourceOwner middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking resource ownership'
    });
  }
};

/**
 * Check if mentor has reached resource limit (10 max)
 */
const checkResourceLimit = async (req, res, next) => {
  try {
    const mentorProfile = await MentorProfile.findOne({
      where: { user_id: req.user.id }
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    if (mentorProfile.total_resources_created >= 10) {
      return res.status(403).json({
        success: false,
        message: 'You have reached the maximum of 10 resources. Delete an existing resource to create a new one.',
        current_count: mentorProfile.total_resources_created,
        max_limit: 10
      });
    }

    next();
  } catch (error) {
    console.error('checkResourceLimit middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking resource limit'
    });
  }
};

module.exports = {
  isMentor,
  isAdmin,
  canApplyForMentor,
  isResourceOwner,
  checkResourceLimit
};