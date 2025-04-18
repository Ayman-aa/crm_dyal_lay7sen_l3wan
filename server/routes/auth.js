const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// @route   POST api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public (but requires refresh token cookie)
router.post('/refresh', authController.refreshToken);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/logout
// @desc    Logout user & clear cookie
// @access  Public
router.post('/logout', authController.logout);

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;