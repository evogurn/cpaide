import express from 'express';
import tenantController from '../controllers/tenant.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { createTenantSchema, updateTenantSchema } from '../validations/tenant.validation.js';
import { requireRole } from '../middlewares/rbac.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Only SUPER_ADMIN can manage tenants (except for creation which is now public)
router.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/') {
    // Allow public tenant creation
    next();
  } else {
    // Require authentication and SUPER_ADMIN role for all other operations
    authenticate(req, res, next);
  }
}, (req, res, next) => {
  if (req.method === 'POST' && req.path === '/') {
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

// Folder template and initialization routes
router.get('/:id/folder-template', tenantController.getFolderTemplate);
router.patch('/:id/folder-template', tenantController.updateFolderTemplate);
router.post('/:id/initialize-folders', tenantController.initializeTenantFolders);

export default router;