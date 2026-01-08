import express from 'express';
import loginHistoryController from '../controllers/loginHistory.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/rbac.js';

const router = express.Router();

// Get login history for a tenant (requires tenant admin access)
router.get('/tenant', 
  authenticate, 
  requireRole(['TENANT_ADMIN', 'SUPER_ADMIN']), 
  loginHistoryController.getLoginHistory
);

// Get login history for current user
router.get('/user', 
  authenticate, 
  loginHistoryController.getUserLoginHistory
);

export default router;