const { NotFoundError, ValidationError, AuthenticationError, AuthorizationError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle custom errors
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  if (err instanceof AuthorizationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Handle Multer errors (file upload errors)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: err.errors.map(e => e.message)
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

module.exports = errorHandler; 