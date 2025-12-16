const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowerCount,
  isFollowing
} = require('../controllers/follow.controller');
const { authenticateToken } = require('../middleware/auth');

// Follow/Unfollow a user (requires authentication)
router.post('/users/:userId/follow', authenticateToken, followUser);
router.delete('/users/:userId/follow', authenticateToken, unfollowUser);

//Check if authenticated user is following a specific user (requires authentication)
router.get('/users/:userId/is-following', authenticateToken, isFollowing);

// Get followers/following lists (public)
router.get('/users/:userId/followers', getFollowers);
router.get('/users/:userId/following', getFollowing);

// Get follower/following counts (public)
router.get('/users/:userId/follower-count', getFollowerCount);

module.exports = router;
