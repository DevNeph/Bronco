const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// GET /api/v1/loyalty - Get user loyalty status
router.get('/', loyaltyController.getLoyaltyStatus);

// GET /api/v1/loyalty/free-coffees - Get available free coffees
router.get('/free-coffees', loyaltyController.getFreeCoffees);

// POST /api/v1/loyalty/use-free-coffee - Use free coffee
router.post('/use-free-coffee', loyaltyController.useFreeCoffee);

// POST /api/v1/loyalty/add-coffee - Add coffee to loyalty program (admin only)
router.post('/add-coffee', isAdmin, loyaltyController.addCoffee);

module.exports = router;