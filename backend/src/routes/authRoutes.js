const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// POST /api/v1/auth/register - Register a new user
router.post('/register', authController.register);

// POST /api/v1/auth/login - Login user
router.post('/login', authController.login);

// POST /api/v1/auth/refresh-token - Refresh access token
router.post('/refresh-token', authController.refreshToken);

// POST /api/v1/auth/forgot-password - Send password reset link
router.post('/forgot-password', authController.forgotPassword);

// POST /api/v1/auth/reset-password - Reset password using token
router.post('/reset-password', authController.resetPassword);

// PUT /api/v1/auth/fcm-token - Update FCM token (requires authentication)
router.put('/fcm-token', authenticate, authController.updateFcmToken);

module.exports = router;