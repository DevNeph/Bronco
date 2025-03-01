const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// GET /api/v1/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/v1/products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// Protected admin routes below
router.use(authenticate, isAdmin);

// POST /api/v1/products - Create new product (admin only)
router.post('/', productController.createProduct);

// PUT /api/v1/products/:id - Update product (admin only)
router.put('/:id', productController.updateProduct);

// DELETE /api/v1/products/:id - Delete product (admin only)
router.delete('/:id', productController.deleteProduct);

// PUT /api/v1/products/:id/availability - Update product availability (admin only)
router.put('/:id/availability', productController.updateProductAvailability);

module.exports = router;