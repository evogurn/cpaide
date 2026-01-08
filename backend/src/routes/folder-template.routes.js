import express from 'express';
import FolderTemplateController from '../controllers/folder-template.controller.js';
import { 
  createTemplateValidation,
  updateTemplateValidation,
  getTemplatesValidation,
  getTemplateByIdValidation,
  deleteTemplateValidation,
  applyTemplateValidation,
  getTemplatesByIndustryValidation,
} from '../validations/folder-template.validation.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/rbac.js';

const router = express.Router();

// Master Admin routes (for creating, updating, deleting templates)
router.post(
  '/', 
  authenticate,
  requireRole(['SUPER_ADMIN']),
  createTemplateValidation,
  FolderTemplateController.createTemplate
);

router.put(
  '/:id', 
  authenticate,
  requireRole(['SUPER_ADMIN']),
  updateTemplateValidation,
  FolderTemplateController.updateTemplate
);

router.delete(
  '/:id', 
  authenticate,
  requireRole(['SUPER_ADMIN']),
  deleteTemplateValidation,
  FolderTemplateController.deleteTemplate
);

// Routes for getting templates (accessible to authenticated users with appropriate roles)
router.get(
  '/', 
  authenticate,
  requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'USER']), // Allow different roles to access templates
  getTemplatesValidation,
  FolderTemplateController.getAllTemplates
);

router.get(
  '/:id', 
  authenticate,
  getTemplateByIdValidation,
  FolderTemplateController.getTemplateById
);

router.get(
  '/industry/:industry',
  authenticate,
  getTemplatesByIndustryValidation,
  FolderTemplateController.getTemplatesByIndustry
);

// Tenant routes (for applying templates to their own tenant)
router.post(
  '/:id/apply',
  authenticate,
  applyTemplateValidation,
  FolderTemplateController.applyTemplateToTenant
);

export default router;