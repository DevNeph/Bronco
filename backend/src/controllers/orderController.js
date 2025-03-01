const { Order, OrderItem, Product, User, Balance, Loyalty, sequelize } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Create a new order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { items, pickupTime, paymentMethod, useFreeCoffee, notes } = req.body;
    
    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError('Order must contain at least one item', 400);
    }
    
    if (!paymentMethod) {
      throw new ApiError('Payment method is required', 400);
    }
    
    // Fetch products to get prices and check availability
    const productIds = items.map(item => item.productId);
    const products = await Product.findAll({
      where: {
        id: productIds,
        isAvailable: true
      }
    });
    
    // Check if all products are available
    if (products.length !== [...new Set(productIds)].length) {
      throw new ApiError('One or more products are not available', 400);
    }
    
    // Calculate total amount
    let totalAmount = 0;
    const productMap = {};
    
    products.forEach(product => {
      productMap[product.id] = product;
    });
    
    items.forEach(item => {
      const product = productMap[item.productId];
      totalAmount += product.price * item.quantity;
    });
    
    // Handle free coffee redemption
    let isFreeOrder = false;
    
    if (useFreeCoffee) {
      const loyalty = await Loyalty.findOne({ where: { userId } });
      
      if (!loyalty || loyalty.getAvailableFreeCoffees() <= 0) {
        throw new ApiError('No free coffees available', 400);
      }
      
      // Check if order contains only one coffee
      if (items.length > 1) {
        throw new ApiError('Free coffee can only be applied to an order with a single coffee', 400);
      }
      
      // Use free coffee
      await loyalty.useFreeCoffee({ transaction });
      isFreeOrder = true;
      totalAmount = 0; // Free coffee means no charge
    }
    
    // Handle payment process
    if (paymentMethod === 'balance' && !isFreeOrder) {
      // Check user balance
      const currentBalance = await Balance.getCurrentBalance(userId);
      
      if (currentBalance < totalAmount) {
        throw new ApiError('Insufficient balance', 400);
      }
    }
    
    // Create order
    const order = await Order.create({
      userId,
      status: 'pending',
      pickupTime: pickupTime ? new Date(pickupTime) : null,
      totalAmount,
      paymentMethod,
      isFreeCoffee: isFreeOrder,
      notes
    }, { transaction });
    
    // Create order items
    const orderItems = [];
    
    for (const item of items) {
      const product = productMap[item.productId];
      
      const orderItem = await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        customization: item.customization || {}
      }, { transaction });
      
      orderItems.push(orderItem);
    }
    
    // Process payment if using balance
    if (paymentMethod === 'balance' && !isFreeOrder) {
      const currentBalance = await Balance.getCurrentBalance(userId);
      
      await Balance.create({
        userId,
        amount: -totalAmount,
        type: 'withdrawal',
        referenceId: order.id,
        balanceAfter: currentBalance - totalAmount,
        description: `Payment for order #${order.id}`
      }, { transaction });
    }
    
    // If order includes coffee and is not free, update loyalty
    if (!isFreeOrder) {
      const hasCoffee = products.some(product => product.category === 'coffee');
      
      if (hasCoffee) {
        // Count number of coffees in order
        const coffeeCount = items.reduce((count, item) => {
          const product = productMap[item.productId];
          if (product.category === 'coffee') {
            return count + item.quantity;
          }
          return count;
        }, 0);
        
        if (coffeeCount > 0) {
          let loyalty = await Loyalty.findOne({ where: { userId } }, { transaction });
          
          if (!loyalty) {
            loyalty = await Loyalty.create({ userId }, { transaction });
          }
          
          await loyalty.addCoffee(coffeeCount, { transaction });
        }
      }
    }
    
    await transaction.commit();
    
    // Get the full order with items
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });
    
    // Notify admin via Socket.IO
    req.app.get('io').to('admin').emit('newOrder', {
      orderId: order.id,
      userId,
      status: 'pending',
      totalAmount,
      pickupTime: pickupTime ? new Date(pickupTime) : null
    });
    
    res.status(201).json({
      status: 'success',
      data: createdOrder
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Get order by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find order
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });
    
    if (!order) {
      throw new ApiError('Order not found', 404);
    }
    
    // Check if order belongs to user or user is admin
    if (order.userId !== userId && !req.user.isAdmin) {
      throw new ApiError('Access denied', 403);
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
 * Cancel order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const cancelOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find order
    const order = await Order.findByPk(id);
    
    if (!order) {
      throw new ApiError('Order not found', 404);
    }
    
    // Check if order belongs to user
    if (order.userId !== userId) {
      throw new ApiError('Access denied', 403);
    }
    
    // Check if order can be cancelled
    if (order.status !== 'pending' && order.status !== 'accepted') {
      throw new ApiError('This order cannot be cancelled', 400);
    }
    
    // Update order status
    await order.update({ status: 'cancelled' }, { transaction });
    
    // Refund if payment was made via balance
    if (order.paymentMethod === 'balance' && order.totalAmount > 0) {
      const currentBalance = await Balance.getCurrentBalance(userId);
      
      await Balance.create({
        userId,
        amount: order.totalAmount,
        type: 'refund',
        referenceId: order.id,
        balanceAfter: currentBalance + order.totalAmount,
        description: `Refund for cancelled order #${order.id}`
      }, { transaction });
    }
    
    // Restore free coffee if used
    if (order.isFreeCoffee) {
      const loyalty = await Loyalty.findOne({ where: { userId } });
      
      if (loyalty) {
        loyalty.usedCoffees = Math.max(0, loyalty.usedCoffees - 1);
        await loyalty.save({ transaction });
      }
    }
    
    await transaction.commit();
    
    // Notify admin via Socket.IO
    req.app.get('io').to('admin').emit('orderUpdate', {
      orderId: order.id,
      userId,
      status: 'cancelled'
    });
    
    res.json({
      status: 'success',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
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
    
    if (!status) {
      throw new ApiError('Status is required', 400);
    }
    
    // Check if status is valid
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ApiError('Invalid status', 400);
    }
    
    // Find order
    const order = await Order.findByPk(id);
    
    if (!order) {
      throw new ApiError('Order not found', 404);
    }
    
    // Update order status
    await order.update({ status });
    
    // Get user for notification
    const user = await User.findByPk(order.userId);
    
    // Send notification to user via Socket.IO
    if (user && user.fcmToken) {
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

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  cancelOrder,
  updateOrderStatus
};