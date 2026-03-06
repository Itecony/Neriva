const express = require('express');
const { getProfile, updateProfile, getAllUsers, getCurrentUser, getUserById, uploadImage } = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth');

const path = require('path');
const multer = require('multer');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, updateProfile);

// @route   POST /api/users/upload-image
// @desc    Upload profile image
// @access  Private
router.post('/upload-image', authenticateToken, upload.single('image'), uploadImage);

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