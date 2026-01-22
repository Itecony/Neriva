const express = require('express');
const { getProfile, updateProfile, getAllUsers } = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, updateProfile);

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/users', authenticateToken, getAllUsers);

module.exports = router;