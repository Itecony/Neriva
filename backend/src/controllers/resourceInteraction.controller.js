const { 
  Resource, 
  ResourceBookmark, 
  ResourceReview, 
  ResourceReviewHelpful,
  ResourceCompletion,
  ResourceComment,
  User,
  MentorProfile
} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Bookmark resource
 * POST /api/resources/:id/bookmark
 */
const bookmarkResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if resource exists
    const resource = await Resource.findByPk(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if already bookmarked
    const existingBookmark = await ResourceBookmark.findOne({
      where: { user_id: userId, resource_id: id }
    });

    if (existingBookmark) {
      return res.status(409).json({
        success: false,
        message: 'Resource already bookmarked',
        data: existingBookmark
      });
    }

    // Create bookmark
    const bookmark = await ResourceBookmark.create({
      user_id: userId,
      resource_id: id,
      status: 'not_started',
      bookmarked_at: new Date()
    });

    // Increment resource bookmark count
    resource.bookmark_count += 1;
    await resource.save();

    // Update mentor's total bookmarks
    const mentorProfile = await MentorProfile.findOne({
      where: { user_id: resource.mentor_id }
    });
    
    if (mentorProfile) {
      mentorProfile.total_bookmarks_received += 1;
      await mentorProfile.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Resource bookmarked successfully',
      data: bookmark
    });

  } catch (error) {
    console.error('Bookmark resource error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error bookmarking resource',
      error: error.message
    });
  }
};

/**
 * Update bookmark status
 * PUT /api/resources/:id/bookmark
 */
const updateBookmarkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    // Validate status
    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be: not_started, in_progress, or completed'
      });
    }

    const bookmark = await ResourceBookmark.findOne({
      where: { user_id: userId, resource_id: id }
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found. Please bookmark the resource first.'
      });
    }

    // Update status and timestamps
    bookmark.status = status;
    
    if (status === 'in_progress' && !bookmark.started_at) {
      bookmark.started_at = new Date();
    }
    
    if (status === 'completed' && !bookmark.completed_at) {
      bookmark.completed_at = new Date();
    }

    await bookmark.save();

    return res.status(200).json({
      success: true,
      message: 'Bookmark status updated successfully',
      data: bookmark
    });

  } catch (error) {
    console.error('Update bookmark status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating bookmark status',
      error: error.message
    });
  }
};

/**
 * Remove bookmark
 * DELETE /api/resources/:id/bookmark
 */
const removeBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const bookmark = await ResourceBookmark.findOne({
      where: { user_id: userId, resource_id: id }
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    // Decrement resource bookmark count
    const resource = await Resource.findByPk(id);
    if (resource && resource.bookmark_count > 0) {
      resource.bookmark_count -= 1;
      await resource.save();

      // Update mentor's total bookmarks
      const mentorProfile = await MentorProfile.findOne({
        where: { user_id: resource.mentor_id }
      });
      
      if (mentorProfile && mentorProfile.total_bookmarks_received > 0) {
        mentorProfile.total_bookmarks_received -= 1;
        await mentorProfile.save();
      }
    }

    await bookmark.destroy();

    return res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully'
    });

  } catch (error) {
    console.error('Remove bookmark error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing bookmark',
      error: error.message
    });
  }
};

/**
 * Mark resource as completed with proof
 * POST /api/resources/:id/complete
 */
const completeResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { proof_link, proof_type, notes } = req.body;

    // Check if resource exists
    const resource = await Resource.findByPk(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Validate proof_type
    if (proof_type && !['github', 'deployed_url', 'neriva_project', 'none'].includes(proof_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid proof type'
      });
    }

    // If proof_type is not none, proof_link is required
    if (proof_type && proof_type !== 'none' && !proof_link) {
      return res.status(400).json({
        success: false,
        message: 'Proof link is required when proof type is specified'
      });
    }

    // Create completion record
    const completion = await ResourceCompletion.create({
      user_id: userId,
      resource_id: id,
      proof_link,
      proof_type: proof_type || 'none',
      notes,
      completed_at: new Date()
    });

    // Increment resource completion count
    resource.completion_count += 1;
    await resource.save();

    // Update mentor's total completions
    const mentorProfile = await MentorProfile.findOne({
      where: { user_id: resource.mentor_id }
    });
    
    if (mentorProfile) {
      mentorProfile.total_completions_received += 1;
      await mentorProfile.save();
    }

    // Update bookmark status to completed if exists
    const bookmark = await ResourceBookmark.findOne({
      where: { user_id: userId, resource_id: id }
    });
    
    if (bookmark) {
      bookmark.status = 'completed';
      bookmark.completed_at = new Date();
      await bookmark.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Resource marked as completed successfully',
      data: completion
    });

  } catch (error) {
    console.error('Complete resource error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error completing resource',
      error: error.message
    });
  }
};

/**
 * Create review
 * POST /api/resources/:id/review
 */
const createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, review_text } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Low ratings require review text
    if (rating <= 2 && (!review_text || review_text.trim().length < 50)) {
      return res.status(400).json({
        success: false,
        message: 'Reviews with ratings of 2 stars or below must include text (minimum 50 characters)'
      });
    }

    // Check if resource exists
    const resource = await Resource.findByPk(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if already reviewed
    const existingReview = await ResourceReview.findOne({
      where: { user_id: userId, resource_id: id }
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this resource. Use PUT to update your review.'
      });
    }

    // Create review
    const review = await ResourceReview.create({
      user_id: userId,
      resource_id: id,
      rating,
      review_text
    });

    // Update resource average rating
    await updateResourceRating(id);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });

  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

/**
 * Update review
 * PUT /api/resources/:id/review
 */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, review_text } = req.body;

    const review = await ResourceReview.findOne({
      where: { user_id: userId, resource_id: id }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (review_text !== undefined) review.review_text = review_text;

    // Validate low rating text requirement
    if (review.rating <= 2 && (!review.review_text || review.review_text.trim().length < 50)) {
      return res.status(400).json({
        success: false,
        message: 'Reviews with ratings of 2 stars or below must include text (minimum 50 characters)'
      });
    }

    await review.save();

    // Update resource average rating
    await updateResourceRating(id);

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

/**
 * Delete review
 * DELETE /api/resources/:id/review
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await ResourceReview.findOne({
      where: { user_id: userId, resource_id: id }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.destroy();

    // Update resource average rating
    await updateResourceRating(id);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

/**
 * Add comment to resource
 * POST /api/resources/:id/comments
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { comment_text, parent_comment_id } = req.body;

    // Validate comment text
    if (!comment_text || comment_text.trim().length < 1 || comment_text.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be between 1 and 2000 characters'
      });
    }

    // Check if resource exists
    const resource = await Resource.findByPk(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // If replying to a comment, verify parent exists
    if (parent_comment_id) {
      const parentComment = await ResourceComment.findByPk(parent_comment_id);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    // Create comment
    const comment = await ResourceComment.create({
      user_id: userId,
      resource_id: id,
      comment_text,
      parent_comment_id
    });

    // Fetch comment with user info
    const commentWithUser = await ResourceComment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'commenter',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: commentWithUser
    });

  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

/**
 * Get comments for resource
 * GET /api/resources/:id/comments
 */
const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get top-level comments (no parent)
    const { count, rows: comments } = await ResourceComment.findAndCountAll({
      where: { 
        resource_id: id,
        parent_comment_id: null
      },
      include: [
        {
          model: User,
          as: 'commenter',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: ResourceComment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'commenter',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        }
      ],
      order: [
        ['created_at', 'DESC'],
        [{ model: ResourceComment, as: 'replies' }, 'created_at', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

/**
 * Mark review as helpful
 * POST /api/reviews/:id/helpful
 */
const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if review exists
    const review = await ResourceReview.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if already marked helpful
    const existingMark = await ResourceReviewHelpful.findOne({
      where: { user_id: userId, review_id: id }
    });

    if (existingMark) {
      return res.status(409).json({
        success: false,
        message: 'You have already marked this review as helpful'
      });
    }

    // Create helpful mark
    await ResourceReviewHelpful.create({
      user_id: userId,
      review_id: id
    });

    // Increment helpful count
    review.helpful_count += 1;
    await review.save();

    return res.status(201).json({
      success: true,
      message: 'Review marked as helpful',
      helpful_count: review.helpful_count
    });

  } catch (error) {
    console.error('Mark review helpful error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error marking review as helpful',
      error: error.message
    });
  }
};

/**
 * Get resource analytics (mentor only)
 * GET /api/resources/:id/analytics
 */
const getResourceAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resource = await Resource.findByPk(id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user is the resource owner
    if (resource.mentor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view analytics for your own resources'
      });
    }

    // Calculate completion rate
    const completionRate = resource.bookmark_count > 0
      ? ((resource.completion_count / resource.bookmark_count) * 100).toFixed(2)
      : 0;

    // Get recent reviews
    const recentReviews = await ResourceReview.findAll({
      where: { resource_id: id },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    return res.status(200).json({
      success: true,
      data: {
        views: resource.view_count,
        bookmarks: resource.bookmark_count,
        completions: resource.completion_count,
        completion_rate: parseFloat(completionRate),
        average_rating: parseFloat(resource.average_rating),
        total_ratings: resource.total_ratings,
        recent_reviews: recentReviews
      }
    });

  } catch (error) {
    console.error('Get resource analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching resource analytics',
      error: error.message
    });
  }
};

/**
 * Helper function to update resource average rating
 */
const updateResourceRating = async (resourceId) => {
  try {
    const reviews = await ResourceReview.findAll({
      where: { resource_id: resourceId }
    });

    const resource = await Resource.findByPk(resourceId);
    
    if (!resource) return;

    if (reviews.length === 0) {
      resource.average_rating = 0;
      resource.total_ratings = 0;
    } else {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      resource.average_rating = (totalRating / reviews.length).toFixed(2);
      resource.total_ratings = reviews.length;
    }

    await resource.save();

    // Update mentor's average rating
    const mentorProfile = await MentorProfile.findOne({
      where: { user_id: resource.mentor_id }
    });

    if (mentorProfile) {
      const allMentorResources = await Resource.findAll({
        where: { mentor_id: resource.mentor_id }
      });

      const resourcesWithRatings = allMentorResources.filter(r => r.total_ratings > 0);
      
      if (resourcesWithRatings.length > 0) {
        const totalAvg = resourcesWithRatings.reduce((sum, r) => sum + parseFloat(r.average_rating), 0);
        mentorProfile.average_resource_rating = (totalAvg / resourcesWithRatings.length).toFixed(2);
      } else {
        mentorProfile.average_resource_rating = null;
      }

      await mentorProfile.save();
    }

  } catch (error) {
    console.error('Update resource rating error:', error);
  }
};

module.exports = {
  bookmarkResource,
  updateBookmarkStatus,
  removeBookmark,
  completeResource,
  createReview,
  updateReview,
  deleteReview,
  addComment,
  getComments,
  markReviewHelpful,
  getResourceAnalytics
};