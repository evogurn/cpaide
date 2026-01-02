import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import { errorResponse } from '../utils/response.js';

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of role names that are allowed
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Authentication required', ERROR_CODES.UNAUTHORIZED, null, HTTP_STATUS.UNAUTHORIZED)
      );
    }

    const userRoles = req.user.userRoles.map(ur => ur.role.name);
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Insufficient permissions', ERROR_CODES.INSUFFICIENT_PERMISSIONS, null, HTTP_STATUS.FORBIDDEN)
      );
    }

    next();
  };
};

/**
 * Permission-based access control middleware
 * @param {string[]} requiredPermissions - Array of permission names required
 */
export const requirePermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Authentication required', ERROR_CODES.UNAUTHORIZED, null, HTTP_STATUS.UNAUTHORIZED)
      );
    }

    // Extract all permissions from user roles
    const userPermissions = new Set();
    req.user.userRoles.forEach(ur => {
      ur.role.permissions.forEach(rp => {
        userPermissions.add(rp.permission.name);
      });
    });

    // Check if user has all required permissions
    const hasPermissions = requiredPermissions.every(perm => userPermissions.has(perm));

    if (!hasPermissions) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Insufficient permissions', ERROR_CODES.INSUFFICIENT_PERMISSIONS, {
          required: requiredPermissions,
          has: Array.from(userPermissions),
        }, HTTP_STATUS.FORBIDDEN)
      );
    }

    next();
  };
};

/**
 * Check if user has any of the specified permissions
 */
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        errorResponse('Authentication required', ERROR_CODES.UNAUTHORIZED, null, HTTP_STATUS.UNAUTHORIZED)
      );
    }

    const userPermissions = new Set();
    req.user.userRoles.forEach(ur => {
      ur.role.permissions.forEach(rp => {
        userPermissions.add(rp.permission.name);
      });
    });

    const hasAnyPermission = permissions.some(perm => userPermissions.has(perm));

    if (!hasAnyPermission) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Insufficient permissions', ERROR_CODES.INSUFFICIENT_PERMISSIONS, null, HTTP_STATUS.FORBIDDEN)
      );
    }

    next();
  };
};
