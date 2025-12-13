const { Follow, User } = require('../models');

/**
 * Follow a user
 * POST /api/users/:userId/follow
 */
const followUser = async (req, res) => {
  try {
    const followerId = req.user.id; // Currently authenticated user
    const { userId } = req.params; // User to follow

    // Validate
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Can't follow yourself
    if (followerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if target user exists
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: userId
      }
    });

    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Create follow relationship
    const follow = await Follow.create({
      follower_id: followerId,
      following_id: userId
    });

    return res.status(201).json({
      success: true,
      message: 'User followed successfully',
      data: follow
    });

  } catch (error) {
    console.error('Follow user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error following user',
      error: error.message
    });
  }
};

/**
 * Unfollow a user
 * DELETE /api/users/:userId/follow
 */
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const follow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: userId
      }
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    await follow.destroy();

    return res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error unfollowing user',
      error: error.message
    });
  }
};

/**
 * Get followers of a user
 * GET /api/users/:userId/followers?page=1&limit=20
 */
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check if target user exists
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get followers (users who follow this user)
    const { count, rows: followers } = await Follow.findAndCountAll({
      where: { following_id: userId },
      include: [
        {
          model: User,
          as: 'followerUser',
          attributes: ['id', 'email', 'firstName', 'lastName', 'profilePicture', 'bio']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: followers.map(f => ({
        ...f.followerUser.dataValues,
        followedAt: f.created_at
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching followers',
      error: error.message
    });
  }
};

/**
 * Get users that a user is following
 * GET /api/users/:userId/following?page=1&limit=20
 */
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check if target user exists
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get following (users this user follows)
    const { count, rows: following } = await Follow.findAndCountAll({
      where: { follower_id: userId },
      include: [
        {
          model: User,
          as: 'followingUser',
          attributes: ['id', 'email', 'firstName', 'lastName', 'profilePicture', 'bio']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      success: true,
      data: following.map(f => ({
        ...f.followingUser.dataValues,
        followedAt: f.created_at
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching following',
      error: error.message
    });
  }
};

/**
 * Get follower count for a user
 * GET /api/users/:userId/follower-count
 */
const getFollowerCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const followerCount = await Follow.count({
      where: { following_id: userId }
    });

    const followingCount = await Follow.count({
      where: { follower_id: userId }
    });

    return res.status(200).json({
      success: true,
      data: {
        user_id: userId,
        followers: followerCount,
        following: followingCount
      }
    });

  } catch (error) {
    console.error('Get follower count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching follower count',
      error: error.message
    });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowerCount
};
