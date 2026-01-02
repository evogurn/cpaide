import { HTTP_STATUS } from '../constants/index.js';

/**
 * Standard success response
 */
export const successResponse = (data, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};

/**
 * Standard error response
 */
export const errorResponse = (message, code, details = null, statusCode = HTTP_STATUS.BAD_REQUEST) => {
  return {
    success: false,
    message,
    code,
    details,
    statusCode,
  };
};

/**
 * Pagination helper
 */
export const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

/**
 * Pagination metadata
 */
export const paginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };
};
