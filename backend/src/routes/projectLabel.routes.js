import express from 'express';
import projectLabelController from '../controllers/projectLabel.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/rbac.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Require authentication for all routes
router.use(authenticate);

// Routes for project label settings
router.get('/', projectLabelController.getProjectLabel);
router.put('/', requireRole([ROLES.TENANT_ADMIN, ROLES.SUPER_ADMIN]), projectLabelController.updateProjectLabel);

export default router;