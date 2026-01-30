import logger from './logger.js';

// Standard API Error Response
export class ApiError extends Error {
  constructor(statusCode, message, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

// Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Log error
  logger.error('Request Error', {
    statusCode,
    code,
    message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.userId || 'anonymous'
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { details, stack: err.stack })
    }
  });
};

// Async handler wrapper to catch errors
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not Found Handler
export const notFoundHandler = (req, res) => {
  const error = new ApiError(
    404,
    `Cannot ${req.method} ${req.originalUrl}`,
    'NOT_FOUND'
  );
  throw error;
};

// Validation error formatter
export const formatValidationError = (validationError) => {
  const details = validationError.errors?.map(err => ({
    field: err.path?.join('.') || 'unknown',
    message: err.message,
    type: err.code
  })) || [];

  return new ApiError(
    400,
    'Validation failed',
    'VALIDATION_ERROR',
    details
  );
};
