import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import { verifyAccessToken } from '../utils/token.js';
import { errorResponse } from '../utils/response.js';
import prisma from '../config/db.js';

/**
 * Admin authentication middleware
 * Verifies JWT token and ensures user has SUPER_ADMIN role
 */
export const requireAdmin = async (req, res, next) => {
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

    // Fetch user from database with roles
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: true,
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

    // Check if user has SUPER_ADMIN role
    const hasSuperAdminRole = user.userRoles.some(
      userRole => userRole.role.name === 'SUPER_ADMIN'
    );

    if (!hasSuperAdminRole) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Access denied: Super admin privileges required', ERROR_CODES.FORBIDDEN, null, HTTP_STATUS.FORBIDDEN)
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