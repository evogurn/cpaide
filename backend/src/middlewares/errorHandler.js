import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import { logger } from '../config/logger.js';
import { errorResponse } from '../utils/response.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse('Invalid token', ERROR_CODES.TOKEN_INVALID, null, HTTP_STATUS.UNAUTHORIZED)
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      errorResponse('Token expired', ERROR_CODES.TOKEN_EXPIRED, null, HTTP_STATUS.UNAUTHORIZED)
    );
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(HTTP_STATUS.CONFLICT).json(
      errorResponse('Resource already exists', ERROR_CODES.ALREADY_EXISTS, err.meta, HTTP_STATUS.CONFLICT)
    );
  }

  if (err.code === 'P2025') {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      errorResponse('Resource not found', ERROR_CODES.NOT_FOUND, null, HTTP_STATUS.NOT_FOUND)
    );
  }

  // Validation errors (Zod)
  if (err.name === 'ZodError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse('Validation failed', ERROR_CODES.VALIDATION_ERROR, err.errors, HTTP_STATUS.BAD_REQUEST)
    );
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      errorResponse('File too large', ERROR_CODES.FILE_TOO_LARGE, null, HTTP_STATUS.BAD_REQUEST)
    );
  }

  // Default error
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const code = err.code || ERROR_CODES.INTERNAL_ERROR;

  return res.status(statusCode).json(
    errorResponse(
      err.message || 'Internal server error',
      code,
      process.env.NODE_ENV === 'development' ? err.stack : null,
      statusCode
    )
  );
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  return res.status(HTTP_STATUS.NOT_FOUND).json(
    errorResponse(`Route ${req.method} ${req.url} not found`, ERROR_CODES.NOT_FOUND, null, HTTP_STATUS.NOT_FOUND)
  );
};
