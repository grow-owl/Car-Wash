const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const AdminUser = require('../models/AdminUser');
const { verifyAdminToken, JWT_SECRET } = require('../middleware/adminAuth');

// Strict Rate Limiting for Admin Login to prevent brute-force attacks
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. For security reasons, please wait 15 minutes.'
  }
});

/**
 * Ensure default owner exists on server startup or first login
 */
const ensureDefaultOwner = async () => {
  try {
    const defaultUsername = (process.env.ADMIN_DEFAULT_USER || 'admin').trim().toLowerCase();
    const existing = await AdminUser.findOne({ username: defaultUsername });
    if (!existing) {
      const defaultOwner = new AdminUser({
        username: defaultUsername,
        password: process.env.ADMIN_DEFAULT_PASS || 'carwash@2026',
        role: 'owner',
        name: 'Car Wash Owner',
        isActive: true
      });
      await defaultOwner.save();
      console.log('Default Owner Account (username: admin) initialized successfully.');
    }
  } catch (err) {
    console.error('Error ensuring default owner account:', err.message);
  }
};

// Check on connection or startup
const mongoose = require('mongoose');
if (mongoose.connection.readyState === 1) {
  ensureDefaultOwner();
} else {
  mongoose.connection.once('connected', ensureDefaultOwner);
}

/**
 * @route   POST /api/admin/auth/login
 * @desc    Authenticate Owner/Admin & return JWT
 * @access  Public (Protected with Rate Limiter)
 */
router.post('/login', adminLoginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password'
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    let admin = await AdminUser.findOne({ username: cleanUsername });

    if (!admin) {
      // Check if this is the first ever login matching the default credentials
      const defaultUser = (process.env.ADMIN_DEFAULT_USER || 'admin').trim().toLowerCase();
      const defaultPass = process.env.ADMIN_DEFAULT_PASS || 'carwash@2026';
      if (cleanUsername === defaultUser && password === defaultPass) {
        await ensureDefaultOwner();
        admin = await AdminUser.findOne({ username: cleanUsername });
      }
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Create JWT Token
    const payload = {
      id: admin._id,
      username: admin.username,
      role: admin.role,
      name: admin.name
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
});

/**
 * @route   GET /api/admin/auth/verify
 * @desc    Verify current admin JWT token session
 * @access  Private
 */
router.get('/verify', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.userDoc._id,
      username: req.userDoc.username,
      role: req.userDoc.role,
      name: req.userDoc.name
    }
  });
});

/**
 * @route   POST /api/admin/auth/change-password
 * @desc    Change Owner / Admin Password
 * @access  Private (Owner/Admin)
 */
router.post('/change-password', verifyAdminToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const admin = await AdminUser.findById(req.adminUser.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
});

module.exports = router;
