import express from 'express';
import tenantController from '../controllers/tenant.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import { PERMISSIONS } from '../constants/index.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Folder template routes
router.get('/folder-template', requirePermission([PERMISSIONS.TENANT_SETTINGS]), tenantController.getFolderTemplate);
router.put('/folder-template', requirePermission([PERMISSIONS.TENANT_SETTINGS]), tenantController.updateFolderTemplate);

export default router;