const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication and admin privileges
router.use(authenticate, isAdmin);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users/admin', adminController.createAdminUser);

// Order management routes
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderDetails);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Settings routes
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// Web Admin CLient
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/products/stats', adminController.getProductsWithStats);
router.get('/users/stats', adminController.getUserStats);

module.exports = router;