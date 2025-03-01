const { User, Order, Balance } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProfile = async (req, res, next) => {
  try {
    // User is already attached to request by the auth middleware
    const user = req.user;
    
    res.json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone } = req.body;
    
    // Update user
    await User.update(
      { firstName, lastName, phone },
      { where: { id: userId } }
    );
    
    // Get updated user
    const updatedUser = await User.findByPk(userId);
    
    res.json({
      status: 'success',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError('Current password is incorrect', 401);
    }
    
    // Update password
    user.passwordHash = newPassword; // Will be hashed in the model hook
    await user.save();
    
    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user orders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, limit = 10, page = 1 } = req.query;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query options
    const options = {
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
    
    // Add status filter if provided
    if (status) {
      options.where.status = status;
    }
    
    // Get orders
    const orders = await Order.findAndCountAll(options);
    
    res.json({
      status: 'success',
      data: {
        orders: orders.rows,
        totalCount: orders.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(orders.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user balance history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getBalanceHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get current balance
    const currentBalance = await Balance.getCurrentBalance(userId);
    
    // Get balance history
    const balanceHistory = await Balance.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      status: 'success',
      data: {
        currentBalance,
        transactions: balanceHistory.rows,
        totalCount: balanceHistory.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(balanceHistory.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUserOrders,
  getBalanceHistory
};