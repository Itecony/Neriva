const express = require('express');
const passport = require('passport');
const { signup, login, googleCallback } = require('../controllers/auth.controller');

const router = express.Router();

// @route   POST /api/signup
// @desc    Register new user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/google
// @desc    Redirect to Google for authentication
// @access  Public
router.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  googleCallback
);

module.exports = router;