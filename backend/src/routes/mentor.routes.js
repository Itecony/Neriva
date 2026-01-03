const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const { isMentor, isAdmin, canApplyForMentor } = require('../middleware/mentor.middleware');
const mentorApplicationController = require('../controllers/mentorApplication.controller');
const mentorProfileController = require('../controllers/mentorProfile.controller');

// ==================== MENTOR APPLICATION ROUTES ====================

// Submit mentor application
router.post(
  '/mentors/apply',
  authenticateToken,
  canApplyForMentor,
  mentorApplicationController.applyForMentor
);

// Get my application
router.get(
  '/mentors/application/:id',
  authenticateToken,
  mentorApplicationController.getMyApplication
);

// Update pending application
router.put(
  '/mentors/application/:id',
  authenticateToken,
  mentorApplicationController.updateApplication
);

// Withdraw application
router.delete(
  '/mentors/application/:id',
  authenticateToken,
  mentorApplicationController.withdrawApplication
);

// Admin: Get all applications (with filters)
router.get(
  '/admin/mentor-applications',
  authenticateToken,
  isAdmin,
  mentorApplicationController.getAllApplications
);

// Admin: Review application (approve/reject)
router.put(
  '/admin/mentor-applications/:id/review',
  authenticateToken,
  isAdmin,
  mentorApplicationController.reviewApplication
);

// ==================== MENTOR PROFILE ROUTES ====================

// Get all mentors (public, with filters)
router.get(
  '/mentors',
  mentorProfileController.getAllMentors
);

// Update my mentor profile (mentor only)
router.put(
  '/mentors/profile',
  authenticateToken,
  isMentor,
  mentorProfileController.updateMyProfile
);

// Get my mentor analytics (mentor only)
router.get(
  '/mentors/analytics',
  authenticateToken,
  isMentor,
  mentorProfileController.getMyAnalytics
);

// Get mentor's resources (public) - static route before dynamic :id
router.get(
  '/mentors/:id/resources',
  mentorProfileController.getMentorResources
);

// Get mentor statistics (public) - static route before dynamic :id
router.get(
  '/mentors/:id/stats',
  mentorProfileController.getMentorStats
);

// Get specific mentor profile (public) - dynamic route last
router.get(
  '/mentors/:id',
  mentorProfileController.getMentorById
);

module.exports = router;