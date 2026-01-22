const { MentorApplication, User, Project, MentorProfile, Notification } = require('../models');
const { Op } = require('sequelize');

/**
 * Submit mentor application
 * POST /api/mentors/apply
 */
const applyForMentor = async (req, res) => {
  try {
    const { essay, selected_projects, domains } = req.body;
    const userId = req.user.id;

    // Validation
    if (!essay || !selected_projects || !domains) {
      return res.status(400).json({
        success: false,
        message: 'Essay, selected projects, and domains are required'
      });
    }

    // Validate essay length
    if (essay.length < 100 || essay.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Essay must be between 100 and 5000 characters'
      });
    }

    // Validate projects array (can be file paths, URLs, or upload identifiers)
    if (!Array.isArray(selected_projects) || selected_projects.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Must select at least 3 projects (files/portfolio items)'
      });
    }

    // Validate domains array
    if (!Array.isArray(domains) || domains.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Must select at least one domain'
      });
    }

    // Validate domain values against allowed list
    const validDomains = [
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'UI/UX Design',
      'DevOps',
      'Cybersecurity',
      'Game Development',
      'Blockchain',
      'Cloud Computing',
      'IoT',
      'AR/VR'
    ];
    
    const invalidDomains = domains.filter(d => !validDomains.includes(d));
    if (invalidDomains.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid domains: ${invalidDomains.join(', ')}. Valid domains are: ${validDomains.join(', ')}`
      });
    }

    // Check if user already has a pending application
    const existingApplication = await MentorApplication.findOne({
      where: {
        user_id: userId,
        status: 'pending'
      }
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending mentor application',
        application_id: existingApplication.id
      });
    }

    // Create application
    // selected_projects stores file paths/URLs/upload identifiers (e.g., portfolio items, CV uploads, etc.)
    const application = await MentorApplication.create({
      user_id: userId,
      essay,
      selected_projects, // Store as-is (array of file paths, URLs, or upload identifiers)
      domains,
      status: 'pending'
    });

    // Create in-app notifications for all admin users so they can review applications
    try {
      const admins = await User.findAll({ where: { role: 'admin' } });
      if (admins && admins.length > 0) {
        const message = `New mentor application submitted by ${req.user.email || req.user.firstName || req.user.id}`;
        await Promise.all(admins.map(admin => Notification.create({
          user_id: admin.id,
          type: 'mentor_application',
          message
        })));
      } else {
        // No admins found — in development mode this may be expected; log for visibility
        console.warn('No admin users found to notify about mentor application.');
      }
    } catch (notifErr) {
      console.error('Failed to create admin notifications:', notifErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Mentor application submitted successfully',
      data: application
    });

  } catch (error) {
    console.error('Apply for mentor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting mentor application',
      error: error.message
    });
  }
};

/**
 * Get my application
 * GET /api/mentors/application/:id
 */
const getMyApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await MentorApplication.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Get application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

/**
 * Update pending application
 * PUT /api/mentors/application/:id
 */
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { essay, domains } = req.body;

    const application = await MentorApplication.findOne({
      where: { id, user_id: userId }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Can only update pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update ${application.status} application. Only pending applications can be updated.`
      });
    }

    // Update fields if provided
    if (essay) {
      if (essay.length < 100 || essay.length > 5000) {
        return res.status(400).json({
          success: false,
          message: 'Essay must be between 100 and 5000 characters'
        });
      }
      application.essay = essay;
    }

    if (domains) {
      if (!Array.isArray(domains) || domains.length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Must select at least one domain'
        });
      }
      application.domains = domains;
    }

    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });

  } catch (error) {
    console.error('Update application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
};

/**
 * Withdraw application
 * DELETE /api/mentors/application/:id
 */
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await MentorApplication.findOne({
      where: { id, user_id: userId }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Can only withdraw pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw ${application.status} application`
      });
    }

    await application.destroy();

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Withdraw application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message
    });
  }
};

/**
 * Admin: Get all applications
 * GET /api/admin/mentor-applications?status=pending
 */
const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: applications } = await MentorApplication.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

/**
 * Admin: Review application (approve/reject)
 * PUT /api/admin/mentor-applications/:id/review
 */
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    const adminId = req.user.id;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    const application = await MentorApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: 'applicant'
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Can only review pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application has already been ${application.status}`
      });
    }

    // Update application
    application.status = status;
    application.admin_notes = admin_notes || null;
    application.reviewed_by = adminId;
    application.reviewed_at = new Date();
    await application.save();

    // If approved, update user and create mentor profile
    if (status === 'approved') {
      const user = await User.findByPk(application.user_id);
      user.is_mentor = true;
      user.mentor_verified_at = new Date();
      await user.save();

      // Check if mentor profile already exists to avoid duplicates
      const existingProfile = await MentorProfile.findOne({
        where: { user_id: application.user_id }
      });

      if (!existingProfile) {
        try {
          await MentorProfile.create({
            user_id: application.user_id,
            expertise_domains: application.domains,
            verified_at: new Date()
          });
          console.log(`✅ MentorProfile created for user ${application.user_id}`);
        } catch (profileErr) {
          console.error(`❌ Failed to create MentorProfile for user ${application.user_id}:`, profileErr.message);
          // Continue anyway — user is marked as mentor, profile can be created manually
        }
      } else {
        console.log(`ℹ️ MentorProfile already exists for user ${application.user_id}`);
      }

      // TODO: Send notification to user about approval
    } else {
      // If rejected, set cooldown (30 days)
      const user = await User.findByPk(application.user_id);
      const cooldownDate = new Date();
      cooldownDate.setDate(cooldownDate.getDate() + 30);
      user.mentor_application_cooldown_until = cooldownDate;
      await user.save();

      // TODO: Send notification to user about rejection with feedback
    }

    return res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application
    });

  } catch (error) {
    console.error('Review application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error reviewing application',
      error: error.message
    });
  }
};

module.exports = {
  applyForMentor,
  getMyApplication,
  updateApplication,
  withdrawApplication,
  getAllApplications,
  reviewApplication
};