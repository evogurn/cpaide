import { ERROR_CODES, HTTP_STATUS } from '../constants/index.js';
import { errorResponse } from '../utils/response.js';

/**
 * Validate request using Zod schema
 */
export const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);
      req[source] = validated;
      next();
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Validation failed', ERROR_CODES.VALIDATION_ERROR, error.errors, HTTP_STATUS.BAD_REQUEST)
      );
    }
  };
};
