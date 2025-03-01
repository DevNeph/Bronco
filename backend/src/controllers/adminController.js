const { User, Order, OrderItem, Product, Balance, Loyalty, Setting, sequelize } = require('../models');
const { Op } = require('sequelize');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all users (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query options
    const options = {
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
    
    // Add search filter if provided
    if (search) {
      options.where = {
        [Op.or]: [
          { email: { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    // Get users
    const users = await User.findAndCountAll(options);
    
    res.json({
      status: 'success',
      data: {
        users: users.rows,
        totalCount: users.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get user
    const user = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] }
    });
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Get user balance
    const currentBalance = await Balance.getCurrentBalance(id);
    
    // Get user loyalty
    const loyalty = await Loyalty.findOne({ where: { userId: id } });
    
    // Get order statistics
    const orderStats = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('*')), 'count']
      ],
      where: { userId: id },
      group: ['status']
    });
    
    // Format order statistics
    const formattedOrderStats = {};
    orderStats.forEach(stat => {
      formattedOrderStats[stat.status] = parseInt(stat.dataValues.count);
    });
    
    res.json({
      status: 'success',
      data: {
        user,
        balance: currentBalance,
        loyalty: loyalty || { coffeeCount: 0, freeCoffees: 0, usedCoffees: 0 },
        orders: formattedOrderStats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create admin user (super admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createAdminUser = async (req, res, next) => {
  try {
    const { email, password, phone, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }]
      }
    });
    
    if (existingUser) {
      throw new ApiError('User with this email or phone already exists', 409);
    }
    
    // Create admin user
    const user = await User.create({
      email,
      passwordHash: password, // Will be hashed in the model hook
      phone,
      firstName,
      lastName,
      isAdmin: true
    });
    
    // Initialize loyalty program for the user
    await Loyalty.create({
      userId: user.id
    });
    
    res.status(201).json({
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
 * Get all orders (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, startDate, endDate, limit = 20, page = 1 } = req.query;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query options
    const options = {
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    };
    
    // Add filters if provided
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    if (Object.keys(where).length > 0) {
      options.where = where;
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
 * Get order details (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find order with all details
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });
    
    if (!order) {
      throw new ApiError('Order not found', 404);
    }
    
    res.json({
      status: 'success',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;
    
    if (!status) {
      throw new ApiError('Status is required', 400);
    }
    
    // Check if status is valid
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ApiError('Invalid status', 400);
    }
    
    // Find order
    const order = await Order.findByPk(id, {
      include: [User]
    });
    
    if (!order) {
      throw new ApiError('Order not found', 404);
    }
    
    // Update order status
    await order.update({ status });
    
    // Handle completed or cancelled status
    if (status === 'completed') {
      order.completedAt = new Date();
      await order.save();
    } else if (status === 'cancelled' && order.paymentMethod === 'balance') {
      // Refund if payment was made via balance
      if (order.totalAmount > 0) {
        const currentBalance = await Balance.getCurrentBalance(order.userId);
        
        await Balance.create({
          userId: order.userId,
          amount: order.totalAmount,
          type: 'refund',
          referenceId: order.id,
          balanceAfter: currentBalance + order.totalAmount,
          description: `Refund for cancelled order #${order.id} by admin ${adminId}`
        });
      }
      
      // Restore free coffee if used
      if (order.isFreeCoffee) {
        const loyalty = await Loyalty.findOne({ where: { userId: order.userId } });
        
        if (loyalty) {
          loyalty.usedCoffees = Math.max(0, loyalty.usedCoffees - 1);
          await loyalty.save();
        }
      }
    }
    
    // Send notification to user via Socket.IO
    if (order.User && order.User.fcmToken) {
      // In a real implementation, you'd send a push notification using FCM
      // For now, just emit to the user's room
      req.app.get('io').to(`user_${order.userId}`).emit('orderUpdate', {
        orderId: order.id,
        status
      });
    }
    
    res.json({
      status: 'success',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system settings (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSettings = async (req, res, next) => {
  try {
    // Get all settings
    const settings = await Setting.findAll();
    
    // Format settings as key-value pairs
    const formattedSettings = {};
    settings.forEach(setting => {
      formattedSettings[setting.id] = setting.value;
    });
    
    res.json({
      status: 'success',
      data: formattedSettings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update system settings (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateSettings = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const adminId = req.user.id;
    
    if (!key || value === undefined) {
      throw new ApiError('Key and value are required', 400);
    }
    
    // Update setting
    const setting = await Setting.setSetting(key, value, adminId);
    
    res.json({
      status: 'success',
      data: setting
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const { period = 'day' } = req.query;
    let dateFormat, periodStart;
    
    // Determine date format and period start based on requested period
    switch(period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - 30); // Last 30 days
        break;
      case 'week':
        dateFormat = '%Y-%U';
        periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - 3); // Last 3 months
        break;
      case 'month':
        dateFormat = '%Y-%m';
        periodStart = new Date();
        periodStart.setFullYear(periodStart.getFullYear() - 1); // Last year
        break;
      default:
        dateFormat = '%Y-%m-%d';
        periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - 30); // Default to last 30 days
    }
    
    // Get sales statistics by period
    const salesByPeriod = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('*')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalSales']
      ],
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: periodStart
        }
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat)],
      order: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat)]
    });
    
    // Get order counts by status
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('*')), 'count']
      ],
      group: ['status']
    });
    
    // Get popular products
    const popularProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
      ],
      include: [{
        model: Product,
        attributes: ['name', 'category']
      }],
      group: ['productId', 'Product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 10
    });
    
    // Get user statistics
    const userStats = await User.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('*')), 'totalUsers'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN created_at >= NOW() - INTERVAL 30 DAY THEN 1 ELSE 0 END')), 'newUsers']
      ]
    });
    
    res.json({
      status: 'success',
      data: {
        salesByPeriod,
        ordersByStatus,
        popularProducts,
        userStats: userStats[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createAdminUser,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getSettings,
  updateSettings,
  getDashboardStats
};