const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const JWT_SECRET = process.env.JWT_SECRET || 'carwash_super_secret_jwt_key_2026_x97k';

/**
 * Middleware to verify Admin/Owner JWT Token
 */
const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Missing or invalid authorization token'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminUser = decoded;

    // Optional: Verify user still exists and isActive in database
    const user = await AdminUser.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account inactive or does not exist'
      });
    }

    req.userDoc = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token'
    });
  }
};

/**
 * Role-based Authorization Guard
 * @param {Array<string>} allowedRoles e.g. ['owner', 'admin']
 */
const requireRole = (allowedRoles = ['owner', 'admin']) => {
  return (req, res, next) => {
    if (!req.adminUser || !allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges for this action'
      });
    }
    next();
  };
};

module.exports = {
  verifyAdminToken,
  requireRole,
  JWT_SECRET
};
