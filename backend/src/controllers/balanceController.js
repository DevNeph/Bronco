const { v4: uuidv4 } = require('uuid');
const { Balance, User, sequelize } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get user current balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCurrentBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get current balance
    const currentBalance = await Balance.getCurrentBalance(userId);
    
    res.json({
      status: 'success',
      data: {
        balance: currentBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate QR code for balance loading
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const generateQrCode = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new ApiError('Valid amount is required', 400);
    }
    
    // Generate a unique code for the QR
    const qrCode = `${userId}:${uuidv4()}:${amount}`;
    
    // In a real implementation, you would store this code temporarily
    // along with its creation time to validate it later
    // Here we'll just return it for demonstration
    
    res.json({
      status: 'success',
      data: {
        qrCode,
        amount: parseFloat(amount),
        expires: new Date(Date.now() + 5 * 60000) // 5 minutes expiry
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add balance to user account (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addBalance = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { qrCode, amount } = req.body;
    const adminId = req.user.id;
    
    if (!qrCode || !amount || isNaN(amount) || amount <= 0) {
      throw new ApiError('Valid QR code and amount are required', 400);
    }
    
    // Decode the QR code to get user ID
    // In a real implementation, you would validate this against stored codes
    const parts = qrCode.split(':');
    if (parts.length !== 3) {
      throw new ApiError('Invalid QR code', 400);
    }
    
    const userId = parts[0];
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Get current balance
    const currentBalance = await Balance.getCurrentBalance(userId);
    
    // Create balance transaction
    const balanceTransaction = await Balance.create({
      userId,
      amount: parseFloat(amount),
      type: 'deposit',
      balanceAfter: currentBalance + parseFloat(amount),
      description: `Balance added by admin ID: ${adminId}`,
      createdAt: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      status: 'success',
      data: {
        transaction: balanceTransaction,
        newBalance: balanceTransaction.balanceAfter
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Process user balance withdrawal (for order payment)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const processWithdrawal = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { amount, referenceId, description } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new ApiError('Valid amount is required', 400);
    }
    
    // Get current balance
    const currentBalance = await Balance.getCurrentBalance(userId);
    
    // Check if user has sufficient balance
    if (currentBalance < amount) {
      throw new ApiError('Insufficient balance', 400);
    }
    
    // Create balance transaction
    const balanceTransaction = await Balance.create({
      userId,
      amount: -parseFloat(amount), // Negative for withdrawal
      type: 'withdrawal',
      referenceId,
      balanceAfter: currentBalance - parseFloat(amount),
      description: description || 'Order payment',
      createdAt: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      status: 'success',
      data: {
        transaction: balanceTransaction,
        newBalance: balanceTransaction.balanceAfter
      }
    });
  } catch (error) {
    await transaction.rollback();
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
  getCurrentBalance,
  generateQrCode,
  addBalance,
  processWithdrawal,
  getBalanceHistory
};