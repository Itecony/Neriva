const express = require('express');
const router = express.Router();
const {
  getOptions,
  submitOnboarding
} = require('../controllers/onboarding.controller');
const { authenticateToken } = require('../middleware/auth');

// Public route to get onboarding options
router.get('/onboarding/options', getOptions);

// authenticateTokened route to submit onboarding data
router.post('/onboarding/submit', authenticateToken, submitOnboarding);

module.exports = router