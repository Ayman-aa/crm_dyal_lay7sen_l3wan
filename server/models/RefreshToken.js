const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revokedReason: {
    type: String,
    default: null
  },
  // IP and user agent for additional security
  issuedIp: String,
  userAgent: String
});

// Add index for faster queries
RefreshTokenSchema.index({ user: 1, token: 1 });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);