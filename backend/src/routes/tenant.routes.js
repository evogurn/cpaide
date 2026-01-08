import express from 'express';
import tenantController from '../controllers/tenant.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { createTenantSchema, updateTenantSchema } from '../validations/tenant.validation.js';
import { requireRole } from '../middlewares/rbac.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Middleware for tenant management operations - SUPER_ADMIN required
router.use((req, res, next) => {
  // Check if the request is for billing endpoints
  if (req.path.startsWith('/billing')) {
    // For billing endpoints, only authentication is required
    authenticate(req, res, next);
  } else if (req.method === 'POST' && req.path === '/') {
    // Allow public tenant creation
    next();
  } else {
    // Require authentication and SUPER_ADMIN role for all other operations
    authenticate(req, res, next);
  }
}, (req, res, next) => {
  // Check if the request is for billing endpoints
  if (req.path.startsWith('/billing')) {
    // For billing endpoints, no role required - just authenticated user
    next();
  } else if (req.method === 'POST' && req.path === '/') {
    // Allow public tenant creation
    next();
  } else {
    // Require SUPER_ADMIN role for all other operations
    requireRole([ROLES.SUPER_ADMIN])(req, res, next);
  }
});

router.post('/', validateRequest(createTenantSchema), tenantController.createTenant);
router.get('/', tenantController.listTenants);
router.get('/:id', tenantController.getTenant);
router.patch('/:id', validateRequest(updateTenantSchema), tenantController.updateTenant);
router.delete('/:id', tenantController.deleteTenant);

// Billing routes - authenticated users can access their own billing info
router.get('/billing', authenticate, tenantController.getTenantBillingInfo);
router.get('/billing/plans', authenticate, tenantController.getPersonalizedBillingPlans);
router.patch('/plan', authenticate, tenantController.updateTenantPlan);

export default router;