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
    
    // Get recent orders
    const recentOrders = await Order.findAll({
      where: { userId: id },
      include: [{
        model: OrderItem,
        include: [Product]
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Get total amount spent
    const totalSpent = await Order.sum('total_amount', {
      where: { 
        userId: id,
        status: 'completed'
      }
    });
    
    res.json({
      status: 'success',
      data: {
        user,
        balance: currentBalance,
        loyalty: loyalty || { coffeeCount: 0, freeCoffees: 0, usedCoffees: 0 },
        orders: formattedOrderStats,
        recentOrders,
        totalSpent: totalSpent || 0
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
    
    // Bazı temel tarih aralıkları
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    
    // Toplam kullanıcı sayısı ve son 30 günde kaydolanlar
    const totalUsersCount = await User.count();
    const newUsersCount = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Günlük, haftalık ve aylık gelirler
    const todayRevenue = await Order.sum('total_amount', {
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: today }
      }
    }) || 0;
    
    const yesterdayRevenue = await Order.sum('total_amount', {
      where: {
        status: 'completed',
        createdAt: { 
          [Op.gte]: yesterday,
          [Op.lt]: today
        }
      }
    }) || 0;
    
    const thisWeekRevenue = await Order.sum('total_amount', {
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: thisWeekStart }
      }
    }) || 0;
    
    const lastWeekRevenue = await Order.sum('total_amount', {
      where: {
        status: 'completed',
        createdAt: { 
          [Op.gte]: lastWeekStart,
          [Op.lt]: thisWeekStart
        }
      }
    }) || 0;
    
    const thisMonthRevenue = await Order.sum('total_amount', {
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: thisMonthStart }
      }
    }) || 0;
    
    const lastMonthRevenue = await Order.sum('total_amount', {
      where: {
        status: 'completed',
        createdAt: { 
          [Op.gte]: lastMonthStart,
          [Op.lt]: thisMonthStart
        }
      }
    }) || 0;
    
    // Siparişlerin durum dağılımı
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('*')), 'count']
      ],
      group: ['status']
    });
    
    // Aktif siparişler (tamamlanmamış veya iptal edilmemiş)
    const activeOrdersCount = await Order.count({
      where: {
        status: {
          [Op.notIn]: ['completed', 'cancelled']
        }
      }
    });
    
    // Bu haftanın günlük siparişleri
    const dailyOrdersThisWeek = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalAmount']
      ],
      where: {
        createdAt: { [Op.gte]: thisWeekStart }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });
    
    // En çok satılan 5 ürün
    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('COUNT', sequelize.col('order_id')), 'orderCount']
      ],
      include: [{
        model: Product,
        attributes: ['name', 'category', 'price', 'imageUrl']
      }],
      group: ['productId', 'Product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 5
    });
    
    // Günlük, haftalık ve aylık sipariş sayıları
    const todayOrdersCount = await Order.count({
      where: {
        createdAt: { [Op.gte]: today }
      }
    });
    
    const yesterdayOrdersCount = await Order.count({
      where: {
        createdAt: { 
          [Op.gte]: yesterday,
          [Op.lt]: today
        }
      }
    });
    
    const thisWeekOrdersCount = await Order.count({
      where: {
        createdAt: { [Op.gte]: thisWeekStart }
      }
    });
    
    const lastWeekOrdersCount = await Order.count({
      where: {
        createdAt: { 
          [Op.gte]: lastWeekStart,
          [Op.lt]: thisWeekStart
        }
      }
    });
    
    // Son 5 sipariş
    const recentOrders = await Order.findAll({
      include: [{
        model: User,
        attributes: ['firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Toplam gelir
    const totalRevenue = await Order.sum('total_amount', {
      where: {
        status: 'completed'
      }
    }) || 0;
    
    // Toplam sipariş sayısı
    const totalOrdersCount = await Order.count();
    
    res.json({
      status: 'success',
      data: {
        users: {
          total: totalUsersCount,
          new: newUsersCount
        },
        orders: {
          total: totalOrdersCount,
          today: todayOrdersCount,
          yesterday: yesterdayOrdersCount,
          thisWeek: thisWeekOrdersCount,
          lastWeek: lastWeekOrdersCount,
          active: activeOrdersCount
        },
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          yesterday: yesterdayRevenue,
          thisWeek: thisWeekRevenue,
          lastWeek: lastWeekRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue
        },
        ordersByStatus,
        dailyOrdersThisWeek,
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ürün istatistikleri dahil tüm ürünleri getir
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProductsWithStats = async (req, res, next) => {
  try {
    const { limit = 50, page = 1, search, category, sortBy = 'sales', sortOrder = 'desc' } = req.query;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Add query conditions if filters are provided
    const where = {};
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    if (category) {
      where.category = category;
    }
    
    // Determine sort column and direction
    let order = [];
    if (sortBy === 'sales') {
      // Default sort by product popularity (requires a subquery)
      order = [[sequelize.literal('totalSold'), sortOrder === 'asc' ? 'ASC' : 'DESC']];
    } else if (['name', 'price', 'category', 'createdAt'].includes(sortBy)) {
      order = [[sortBy, sortOrder === 'asc' ? 'ASC' : 'DESC']];
    }
    
    // Get products with sales stats
    const products = await Product.findAndCountAll({
      where,
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(COUNT(*), 0)
              FROM order_items
              WHERE order_items.product_id = "Product".id
            )`),
            'orderCount'
          ],
          [
            sequelize.literal(`(
              SELECT COALESCE(SUM(quantity), 0)
              FROM order_items
              WHERE order_items.product_id = "Product".id
            )`),
            'totalSold'
          ]
        ]
      },
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Get product categories for filtering
    const categories = await Product.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      order: [['category', 'ASC']]
    });
    
    res.json({
      status: 'success',
      data: {
        products: products.rows,
        totalCount: products.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(products.count / limit),
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Kullanıcı istatistiklerini getir
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserStats = async (req, res, next) => {
  try {
    // Son 6 ay için kullanıcı kaydı istatistikleri
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userRegistrationsByMonth = await User.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']]
    });
    
    // En çok harcama yapan ilk 10 kullanıcı
    const topSpenders = await User.findAll({
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'email',
        [sequelize.fn('SUM', sequelize.col('Orders.total_amount')), 'totalSpent'],
        [sequelize.fn('COUNT', sequelize.col('Orders.id')), 'orderCount']
      ],
      include: [{
        model: Order,
        attributes: [],
        where: { status: 'completed' }
      }],
      group: ['User.id'],
      order: [[sequelize.fn('SUM', sequelize.col('Orders.total_amount')), 'DESC']],
      limit: 10
    });
    
    // Active users (placed order in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.count({
      include: [{
        model: Order,
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo }
        },
        required: true
      }]
    });
    
    // Toplam kullanıcı sayısı
    const totalUsers = await User.count();
    
    // Adminlerin sayısı
    const adminCount = await User.count({
      where: { isAdmin: true }
    });
    
    res.json({
      status: 'success',
      data: {
        userRegistrationsByMonth,
        topSpenders,
        activeUsers,
        totalUsers,
        adminCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bakiye istatistiklerini getir
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getBalanceStats = async (req, res, next) => {
  try {
    // Toplam yüklenen bakiye
    const totalDeposits = await Balance.sum('amount', {
      where: { type: 'deposit' }
    }) || 0;
    
    // Toplam harcanan bakiye
    const totalWithdrawals = await Balance.sum('amount', {
      where: { type: 'withdrawal' }
    }) || 0;
    
    // Toplam iade edilen bakiye
    const totalRefunds = await Balance.sum('amount', {
      where: { type: 'refund' }
    }) || 0;
    
    // Sistemdeki toplam bakiye
    const totalSystemBalance = totalDeposits + totalWithdrawals + totalRefunds;
    
    // Son 6 ay için bakiye yükleme istatistikleri
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const depositsByMonth = await Balance.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'amount']
      ],
      where: {
        type: 'deposit',
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']]
    });
    
    // En son 10 bakiye işlemi
    const recentTransactions = await Balance.findAll({
      include: [{
        model: User,
        attributes: ['firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.json({
      status: 'success',
      data: {
        totalDeposits,
        totalWithdrawals,
        totalRefunds,
        totalSystemBalance,
        depositsByMonth,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sadakat programı istatistiklerini getir
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLoyaltyStats = async (req, res, next) => {
  try {
    // Toplam kazanılan bedava kahve sayısı
    const totalFreeCoffees = await Loyalty.sum('free_coffees');
    
    // Toplam kullanılan bedava kahve sayısı
    const totalUsedCoffees = await Loyalty.sum('used_coffees');
    
    // Bedava kahve kullanımı olan siparişler
    const freeCoffeeOrders = await Order.count({
      where: { isFreeCoffee: true }
    });
    
    // Toplam kahve sayacı
    const totalCoffeeCount = await Loyalty.sum('coffee_count');
    
    // En sadık 10 müşteri
    const loyalCustomers = await Loyalty.findAll({
      attributes: [
        'userId',
        'coffeeCount',
        'freeCoffees',
        'usedCoffees'
      ],
      include: [{
        model: User,
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['coffeeCount', 'DESC']],
      limit: 10
    });
    
    res.json({
      status: 'success',
      data: {
        totalFreeCoffees: totalFreeCoffees || 0,
        totalUsedCoffees: totalUsedCoffees || 0,
        availableFreeCoffees: (totalFreeCoffees || 0) - (totalUsedCoffees || 0),
        freeCoffeeOrders,
        totalCoffeeCount: totalCoffeeCount || 0,
        loyalCustomers
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
  getDashboardStats,
  getProductsWithStats,
  getUserStats,
  getBalanceStats,
  getLoyaltyStats
};