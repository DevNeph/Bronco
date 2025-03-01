const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// POST /api/v1/orders - Create a new order
router.post('/', orderController.createOrder);

// GET /api/v1/orders/:id - Get order by ID
router.get('/:id', orderController.getOrderById);

// GET /api/v1/orders - Get user orders
router.get('/', orderController.getUserOrders);

// PUT /api/v1/orders/:id/cancel - Cancel order
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;