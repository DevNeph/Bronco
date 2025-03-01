const { Product } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { category, available, limit = 50, page = 1 } = req.query;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query options
    const options = {
      order: [['category', 'ASC'], ['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
    
    // Add filters if provided
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (available === 'true') {
      where.isAvailable = true;
    }
    
    if (Object.keys(where).length > 0) {
      options.where = where;
    }
    
    // Get products
    const products = await Product.findAndCountAll(options);
    
    res.json({
      status: 'success',
      data: {
        products: products.rows,
        totalCount: products.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(products.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get product
    const product = await Product.findByPk(id);
    
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    
    res.json({
      status: 'success',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl, customizationOptions } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      throw new ApiError('Name, price, and category are required', 400);
    }
    
    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      customizationOptions,
      isAvailable: true
    });
    
    res.status(201).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl, isAvailable, customizationOptions } = req.body;
    
    // Find product
    const product = await Product.findByPk(id);
    
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    
    // Update product
    await product.update({
      name: name !== undefined ? name : product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      category: category !== undefined ? category : product.category,
      imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable : product.isAvailable,
      customizationOptions: customizationOptions !== undefined ? customizationOptions : product.customizationOptions
    });
    
    res.json({
      status: 'success',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find product
    const product = await Product.findByPk(id);
    
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    
    // Delete product
    await product.destroy();
    
    res.json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product availability (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateProductAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    
    if (isAvailable === undefined) {
      throw new ApiError('isAvailable field is required', 400);
    }
    
    // Find product
    const product = await Product.findByPk(id);
    
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    
    // Update availability
    await product.update({ isAvailable });
    
    res.json({
      status: 'success',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductAvailability
};