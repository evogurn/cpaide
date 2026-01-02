import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import { verifyAccessToken } from '../utils/token.js';
import { errorResponse } from '../utils/response.js';
import prisma from '../config/db.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.accessToken;

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('No token provided', ERROR_CODES.UNAUTHORIZED, null, HTTP_STATUS.UNAUTHORIZED)
      );
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        tenant: true,
      },
    });

    if (!user || user.deletedAt) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('User not found', ERROR_CODES.UNAUTHORIZED, null, HTTP_STATUS.UNAUTHORIZED)
      );
    }

    if (user.status !== 'ACTIVE') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('User account is not active', ERROR_CODES.FORBIDDEN, null, HTTP_STATUS.FORBIDDEN)
      );
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    req.tenantId = user.tenantId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Invalid or expired token', ERROR_CODES.TOKEN_INVALID, null, HTTP_STATUS.UNAUTHORIZED)
      );
    }
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is provided, but doesn't fail if not
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.cookies?.accessToken;

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true },
    });

    if (user && !user.deletedAt && user.status === 'ACTIVE') {
      req.user = user;
      req.userId = user.id;
      req.tenantId = user.tenantId;
    }
  } catch (error) {
    // Silently ignore invalid tokens for optional auth
  }

  next();
};
