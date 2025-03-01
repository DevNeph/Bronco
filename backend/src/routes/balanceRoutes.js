const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// GET /api/v1/balance - Get user current balance
router.get('/', balanceController.getCurrentBalance);

// POST /api/v1/balance/generate-qr - Generate QR code for balance loading
router.post('/generate-qr', balanceController.generateQrCode);

// POST /api/v1/balance/add - Add balance to user account (admin only)
router.post('/add', isAdmin, balanceController.addBalance);

// POST /api/v1/balance/withdraw - Process user balance withdrawal
router.post('/withdraw', balanceController.processWithdrawal);

// GET /api/v1/balance/history - Get user balance history
router.get('/history', balanceController.getBalanceHistory);

module.exports = router;