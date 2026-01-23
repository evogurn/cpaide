import express from 'express';
import { requireAdmin } from '../middlewares/adminAuth.js';
import { validateRequest } from '../middlewares/validate.js';
import { resetPasswordSchema } from '../validations/user.validation.js';
import { 
  getAdminDashboard,
  getAllTenants,
  updateTenantStatus,
  getAllUsers,
  updateUserStatus,
  approveTenant,
  rejectTenant,
  getPendingTenants,
  updateTenant,
  getAllBillingPlans,
  upsertBillingPlan,
  deleteBillingPlan,
  updateTenantPricing,
  getTenantBillingInfo,
  resetUserPassword,
  updateUserAdmin,
  deleteUserAdmin,
  createUserAdmin
} from '../controllers/admin.controller.js';

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getAdminDashboard);

// Tenants
router.get('/tenants', getAllTenants);
router.get('/tenants/pending', getPendingTenants);
router.patch('/tenants/:tenantId/status', updateTenantStatus);
router.patch('/tenants/:tenantId/approve', approveTenant);
router.patch('/tenants/:tenantId/reject', rejectTenant);
router.patch('/tenants/:tenantId', updateTenant);

// Users
router.get('/users', getAllUsers);
router.post('/users', createUserAdmin);
router.patch('/users/:userId/status', updateUserStatus);
router.patch('/users/:userId/password', validateRequest(resetPasswordSchema), resetUserPassword);
router.patch('/users/:userId', updateUserAdmin);
router.delete('/users/:userId', deleteUserAdmin);

// Billing Plans
router.get('/billing/plans', getAllBillingPlans);
router.post('/billing/plans', upsertBillingPlan);
router.put('/billing/plans/:planId', upsertBillingPlan);
router.delete('/billing/plans/:planId', deleteBillingPlan);

// Tenant Pricing
router.get('/tenants/:tenantId/billing', getTenantBillingInfo);
router.patch('/tenants/:tenantId/pricing', updateTenantPricing);

export default router;