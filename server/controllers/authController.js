const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
require('dotenv').config();

// Helper function to generate tokens
const generateTokens = async (user, ip, userAgent) => {
  // Generate access token - short lived (15 minutes)
  const accessToken = jwt.sign(
    {
      user: {
        id: user.id,
        role: user.role
      }
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Generate refresh token - longer lived (7 days)
  const refreshTokenValue = crypto.randomBytes(40).toString('hex');
  const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Save refresh token to database
  const refreshToken = new RefreshToken({
    user: user.id,
    token: refreshTokenValue,
    expires: refreshTokenExpires,
    issuedIp: ip,
    userAgent: userAgent
  });

  await refreshToken.save();

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    refreshTokenExpires
  };
};

// Login user and set tokens in cookies
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Get IP and user agent
    const ip = req.ip;
    const userAgent = req.get('user-agent') || '';

    // Generate tokens
    const { accessToken, refreshToken, refreshTokenExpires } = 
      await generateTokens(user, ip, userAgent);

    // Set HTTP-only cookies
    // Access token cookie - short lived
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Refresh token cookie - longer lived
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh', // Only sent to refresh endpoint
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return user info (without password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.json({ user: userResponse });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshTokenValue = req.cookies.refreshToken;

    if (!refreshTokenValue) {
      return res.status(401).json({ msg: 'No refresh token' });
    }

    // Find the token in the database
    const storedRefreshToken = await RefreshToken.findOne({ 
      token: refreshTokenValue,
      revokedAt: null,
      expires: { $gt: Date.now() }
    });

    // If token not found or expired
    if (!storedRefreshToken) {
      return res.status(401).json({ msg: 'Invalid refresh token' });
    }

    // Get the user
    const user = await User.findById(storedRefreshToken.user);
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    // Get IP and user agent
    const ip = req.ip;
    const userAgent = req.get('user-agent') || '';

    // Generate new tokens
    const { accessToken, refreshToken, refreshTokenExpires } = 
      await generateTokens(user, ip, userAgent);

    // Revoke the old refresh token
    storedRefreshToken.revokedAt = Date.now();
    storedRefreshToken.revokedReason = 'Replaced by new token';
    await storedRefreshToken.save();

    // Set HTTP-only cookies with new tokens
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    // If refresh token exists, revoke it
    if (refreshToken) {
      const storedRefreshToken = await RefreshToken.findOne({ 
        token: refreshToken,
        revokedAt: null
      });

      if (storedRefreshToken) {
        storedRefreshToken.revokedAt = Date.now();
        storedRefreshToken.revokedReason = 'User logout';
        await storedRefreshToken.save();
      }
    }

    // Clear cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};