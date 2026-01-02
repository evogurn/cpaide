import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import { errorResponse } from '../utils/response.js';
import prisma from '../config/db.js';

/**
 * Tenant middleware - ensures tenant context
 * Extracts tenantId from various sources
 */
export const tenantMiddleware = async (req, res, next) => {
  try {
    let tenantId = null;

    // Priority 1: From authenticated user
    if (req.tenantId) {
      tenantId = req.tenantId;
    }
    // Priority 2: From custom header
    else if (req.headers['x-tenant-id']) {
      tenantId = req.headers['x-tenant-id'];
    }
    // Priority 3: From subdomain
    else if (req.headers.host) {
      const subdomain = req.headers.host.split('.')[0];
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain },
      });
      if (tenant) {
        tenantId = tenant.id;
      }
    }

    if (!tenantId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse('Tenant context required', ERROR_CODES.BAD_REQUEST, null, HTTP_STATUS.BAD_REQUEST)
      );
    }

    // Verify tenant exists and is active
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || tenant.deletedAt) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse('Tenant not found', ERROR_CODES.NOT_FOUND, null, HTTP_STATUS.NOT_FOUND)
      );
    }

    if (tenant.status !== 'ACTIVE') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Tenant is not active', ERROR_CODES.FORBIDDEN, null, HTTP_STATUS.FORBIDDEN)
      );
    }

    req.tenant = tenant;
    req.tenantId = tenant.id;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify user belongs to the tenant
 */
export const verifyTenantAccess = (req, res, next) => {
  if (req.user && req.user.tenantId !== req.tenantId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      errorResponse('Access denied to this tenant', ERROR_CODES.TENANT_MISMATCH, null, HTTP_STATUS.FORBIDDEN)
    );
  }
  next();
};
