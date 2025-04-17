const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET api/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;