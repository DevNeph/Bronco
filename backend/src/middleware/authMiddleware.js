const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const { User } = require('../models');

/**
 * User authentication middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('No authentication token, access denied', 401);
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin authentication middleware
 */
const isAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated first
    if (!req.user) {
      throw new ApiError('Not authenticated', 401);
    }

    // Check if user has admin privileges
    if (!req.user.isAdmin) {
      throw new ApiError('Access denied, admin privileges required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  isAdmin
};