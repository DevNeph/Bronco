const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// GET /api/v1/users/me - Get current user profile
router.get('/me', userController.getProfile);

// PUT /api/v1/users/me - Update current user profile
router.put('/me', userController.updateProfile);

// PUT /api/v1/users/me/password - Change user password
router.put('/me/password', userController.changePassword);

// GET /api/v1/users/me/orders - Get user orders
router.get('/me/orders', userController.getUserOrders);

// GET /api/v1/users/me/balance/history - Get user balance history
router.get('/me/balance/history', userController.getBalanceHistory);

module.exports = router;