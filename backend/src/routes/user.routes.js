const express = require('express');
const { getProfile, updateProfile, getAllUsers, getCurrentUser, getUserById } = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();// @route   GET /api/profile
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

// @route   GET /api/users/me
// @desc    Get current user info
// @access  Private
router.get('/users/profile', authenticateToken, getCurrentUser);

// @route   GET /api/users/:id
// @desc    Get user by id
// @access  Private
router.get('/users/:id', authenticateToken, getUserById);

module.exports = router;