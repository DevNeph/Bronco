const { Loyalty, Setting } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get user loyalty status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLoyaltyStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's loyalty info
    let loyalty = await Loyalty.findOne({ where: { userId } });
    
    // If loyalty doesn't exist, create it
    if (!loyalty) {
      loyalty = await Loyalty.create({ userId });
    }
    
    // Get loyalty program settings
    const loyaltySettings = await Setting.getSetting('loyalty_program', {
      coffeeThreshold: 10, // Default: 10 coffees for 1 free
      enabled: true
    });
    
    // Calculate progress to next free coffee
    const progress = loyalty.coffeeCount % loyaltySettings.coffeeThreshold;
    const progressPercentage = (progress / loyaltySettings.coffeeThreshold) * 100;
    
    res.json({
      status: 'success',
      data: {
        coffeeCount: loyalty.coffeeCount,
        freeCoffees: loyalty.freeCoffees,
        usedCoffees: loyalty.usedCoffees,
        availableFreeCoffees: loyalty.getAvailableFreeCoffees(),
        progress,
        progressPercentage,
        coffeeThreshold: loyaltySettings.coffeeThreshold,
        enabled: loyaltySettings.enabled
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add coffee to loyalty program
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addCoffee = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { coffeeCount = 1 } = req.body;
    
    if (coffeeCount <= 0) {
      throw new ApiError('Coffee count must be positive', 400);
    }
    
    // Get user's loyalty info
    let loyalty = await Loyalty.findOne({ where: { userId } });
    
    // If loyalty doesn't exist, create it
    if (!loyalty) {
      loyalty = await Loyalty.create({ userId });
    }
    
    // Add coffee to loyalty
    await loyalty.addCoffee(coffeeCount);
    
    // Refresh loyalty data
    loyalty = await Loyalty.findOne({ where: { userId } });
    
    res.json({
      status: 'success',
      message: 'Coffee added to loyalty program',
      data: {
        coffeeCount: loyalty.coffeeCount,
        freeCoffees: loyalty.freeCoffees,
        usedCoffees: loyalty.usedCoffees,
        availableFreeCoffees: loyalty.getAvailableFreeCoffees()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Use free coffee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const useFreeCoffee = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's loyalty info
    let loyalty = await Loyalty.findOne({ where: { userId } });
    
    // Check if loyalty exists
    if (!loyalty) {
      throw new ApiError('Loyalty program not found for this user', 404);
    }
    
    // Check if user has free coffees
    if (loyalty.getAvailableFreeCoffees() <= 0) {
      throw new ApiError('No free coffees available', 400);
    }
    
    // Use free coffee
    await loyalty.useFreeCoffee();
    
    // Refresh loyalty data
    loyalty = await Loyalty.findOne({ where: { userId } });
    
    res.json({
      status: 'success',
      message: 'Free coffee used successfully',
      data: {
        coffeeCount: loyalty.coffeeCount,
        freeCoffees: loyalty.freeCoffees,
        usedCoffees: loyalty.usedCoffees,
        availableFreeCoffees: loyalty.getAvailableFreeCoffees()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available free coffees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFreeCoffees = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's loyalty info
    let loyalty = await Loyalty.findOne({ where: { userId } });
    
    // If loyalty doesn't exist, create it
    if (!loyalty) {
      loyalty = await Loyalty.create({ userId });
    }
    
    res.json({
      status: 'success',
      data: {
        availableFreeCoffees: loyalty.getAvailableFreeCoffees()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLoyaltyStatus,
  addCoffee,
  useFreeCoffee,
  getFreeCoffees
};