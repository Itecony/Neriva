const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isMentor, isResourceOwner, checkResourceLimit } = require('../middleware/mentor.middleware');
const resourceController = require('../controllers/resource.controller');
const resourceInteractionController = require('../controllers/resourceInteraction.controller');
const learningDashboardController = require('../controllers/learningDashboard.controller');

// ==================== RESOURCE CRUD ROUTES ====================

// Create resource (mentor only)
router.post(
  '/resources',
  authenticateToken,
  isMentor,
  checkResourceLimit,
  resourceController.createResource
);

// Get all resources (public, with filters)
router.get(
  '/resources',
  resourceController.getAllResources
);

// Search resources (public)
router.get(
  '/resources/search',
  resourceController.searchResources
);

// Get featured resources (public)
router.get(
  '/resources/featured',
  resourceController.getFeaturedResources
);

// Get trending resources (public)
router.get(
  '/resources/trending',
  resourceController.getTrendingResources
);

// Get specific resource (public)
router.get(
  '/resources/:id',
  resourceController.getResourceById
);

// Update resource (owner only)
router.put(
  '/resources/:id',
  authenticateToken,
  isResourceOwner,
  resourceController.updateResource
);

// Delete resource (owner only)
router.delete(
  '/resources/:id',
  authenticateToken,
  isResourceOwner,
  resourceController.deleteResource
);

// ==================== RESOURCE INTERACTION ROUTES ====================

// Bookmark resource
router.post(
  '/resources/:id/bookmark',
  authenticateToken,
  resourceInteractionController.bookmarkResource
);

// Update bookmark status
router.put(
  '/resources/:id/bookmark',
  authenticateToken,
  resourceInteractionController.updateBookmarkStatus
);

// Remove bookmark
router.delete(
  '/resources/:id/bookmark',
  authenticateToken,
  resourceInteractionController.removeBookmark
);

// Mark resource as completed
router.post(
  '/resources/:id/complete',
  authenticateToken,
  resourceInteractionController.completeResource
);

// Create/update review
router.post(
  '/resources/:id/review',
  authenticateToken,
  resourceInteractionController.createReview
);

// Update review
router.put(
  '/resources/:id/review',
  authenticateToken,
  resourceInteractionController.updateReview
);

// Delete review
router.delete(
  '/resources/:id/review',
  authenticateToken,
  resourceInteractionController.deleteReview
);

// Add comment to resource
router.post(
  '/resources/:id/comments',
  authenticateToken,
  resourceInteractionController.addComment
);

// Get all comments for resource (public)
router.get(
  '/resources/:id/comments',
  resourceInteractionController.getComments
);

// Mark review as helpful
router.post(
  '/reviews/:id/helpful',
  authenticateToken,
  resourceInteractionController.markReviewHelpful
);

// Get resource analytics (mentor only, for their own resources)
router.get(
  '/resources/:id/analytics',
  authenticateToken,
  isMentor,
  resourceInteractionController.getResourceAnalytics
);

// ==================== LEARNING DASHBOARD ROUTES ====================

// Get user's learning dashboard
router.get(
  '/users/learning-dashboard',
  authenticateToken,
  learningDashboardController.getDashboard
);

// Get user's bookmarked resources
router.get(
  '/users/bookmarks',
  authenticateToken,
  learningDashboardController.getBookmarks
);

// Get user's completed resources
router.get(
  '/users/completed',
  authenticateToken,
  learningDashboardController.getCompletedResources
);

// Get user's reviews
router.get(
  '/users/reviews',
  authenticateToken,
  learningDashboardController.getMyReviews
);

module.exports = router;