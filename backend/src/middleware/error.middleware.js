const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */
const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.user ? req.user.id : null,
    });

    // Database errors
    if (err.code === '23505') {
        // Unique constraint violation
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: 'Resource already exists',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }

    if (err.code === '23503') {
        // Foreign key constraint violation
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Invalid reference to related resource',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }

    if (err.code === '23502') {
        // Not null constraint violation
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Required field is missing',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_TOKEN,
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: 'Token has expired',
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_INPUT,
            errors: err.errors,
        });
    }

    // Custom application errors
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
    }

    // Default internal server error
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
    logger.warn('Route not found:', {
        path: req.path,
        method: req.method,
    });

    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Route not found',
        path: req.path,
    });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
};
