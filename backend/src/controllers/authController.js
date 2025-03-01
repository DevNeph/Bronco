const jwt = require('jsonwebtoken');
const { User, Loyalty, sequelize } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Generate JWT tokens
 * @param {Object} user - User instance
 * @returns {Object} - Access and refresh tokens
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
};

/**
 * User registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
  try {
    const { email, password, phone, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [sequelize.Op.or]: [{ email }, { phone }]
      }
    });
    
    if (existingUser) {
      throw new ApiError('User with this email or phone already exists', 409);
    }
    
    // Create user
    const user = await User.create({
      email,
      passwordHash: password, // Will be hashed in the model hook
      phone,
      firstName,
      lastName
    });
    
    // Initialize loyalty program for the user
    await Loyalty.create({
      userId: user.id
    });
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    // Send response
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        },
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError('Invalid email or password', 401);
    }
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    // Send response
    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        },
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new ApiError('Refresh token is required', 400);
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
      throw new ApiError('Invalid or expired refresh token', 401);
    }
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Generate new tokens
    const tokens = generateTokens(user);
    
    // Send response
    res.json({
      status: 'success',
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send password reset link
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // If user doesn't exist, don't reveal that
    if (!user) {
      return res.json({
        status: 'success',
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // In a production environment, you would send an email with the reset link
    // For development, we'll just return the token
    
    res.json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent',
      data: { resetToken } // Remove this in production
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      throw new ApiError('Token and new password are required', 400);
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new ApiError('Invalid or expired token', 401);
    }
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Update password
    user.passwordHash = newPassword; // Will be hashed in the model hook
    await user.save();
    
    res.json({
      status: 'success',
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user FCM token for push notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;
    
    // Update user with the new FCM token
    await User.update(
      { fcmToken },
      { where: { id: userId } }
    );
    
    res.json({
      status: 'success',
      message: 'FCM token updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  updateFcmToken
};