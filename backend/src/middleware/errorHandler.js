/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: err.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
  
    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        status: 'error',
        message: 'Unique constraint error',
        errors: err.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }
  
    // Custom API error
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        status: 'error',
        message: err.message
      });
    }
  
    // Default to 500 server error
    return res.status(500).json({
      status: 'error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    });
  };
  
  // Custom API Error class
  class ApiError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = 'ApiError';
    }
  }
  
  module.exports = {
    errorHandler,
    ApiError
  };