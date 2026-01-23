import tenantService from '../services/tenant.service.js';
import notificationService from '../services/notification.service.js';
import { HTTP_STATUS, NOTIFICATION_TYPES } from '../constants/index.js';
import { successResponse, paginationMeta } from '../utils/response.js';

class TenantController {
  async createTenant(req, res, next) {
    try {
      const tenant = await tenantService.createTenant(req.body);
      
      // Send notification to master admin about new tenant registration
      try {
        await notificationService.sendTenantRegistrationNotification(tenant);
      } catch (notificationError) {
        console.error('Failed to send tenant registration notification:', notificationError);
      }
      
      return res.status(HTTP_STATUS.CREATED).json(
        successResponse(tenant, 'Tenant created', HTTP_STATUS.CREATED)
      );
    } catch (error) {
      next(error);
    }
  }

  async getTenant(req, res, next) {
    try {
      const tenant = await tenantService.getTenantById(req.params.id);
      return res.status(HTTP_STATUS.OK).json(successResponse(tenant, 'Tenant retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async listTenants(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const { tenants, total } = await tenantService.listTenants({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          tenants,
          pagination: paginationMeta(total, parseInt(page), parseInt(limit)),
        }, 'Tenants retrieved')
      );
    } catch (error) {
      next(error);
    }
  }

  async updateTenant(req, res, next) {
    try {
      // Get current tenant data for comparison
      const prisma = await import('../config/db.js').then(m => m.default);
      const currentTenant = await prisma.tenant.findUnique({
        where: { id: req.params.id }
      });
      
      const tenant = await tenantService.updateTenant(req.params.id, req.body);
      
      // Send notifications for specific tenant activities
      try {
        // Organization name change notification
        if (req.body.name && req.body.name !== currentTenant.name) {
          await notificationService.sendTenantOrgNameChangeNotification(
            tenant, 
            currentTenant.name, 
            req.user
          );
        }
        
        // Login/Registration UI update notification (if applicable)
        if (req.body.loginPageConfig || req.body.registrationPageConfig) {
          const updateType = req.body.loginPageConfig ? 'Login Page' : 'Registration Page';
          await notificationService.sendTenantUIUpdateNotification(
            tenant, 
            updateType, 
            req.user
          );
        }
        
        // Billing plan update notification
        if (req.body.subscriptionPlanId && req.body.subscriptionPlanId !== currentTenant.subscriptionPlanId) {
          const newPlan = await prisma.subscriptionPlan.findUnique({
            where: { id: req.body.subscriptionPlanId }
          });
          const oldPlan = currentTenant.subscriptionPlanId ? 
            await prisma.subscriptionPlan.findUnique({
              where: { id: currentTenant.subscriptionPlanId }
            }) : null;
          
          await notificationService.sendTenantBillingPlanUpdateNotification(
            tenant, 
            oldPlan, 
            newPlan, 
            req.user
          );
        }
      } catch (notificationError) {
        console.error('Failed to send tenant activity notifications:', notificationError);
      }
      
      return res.status(HTTP_STATUS.OK).json(successResponse(tenant, 'Tenant updated'));
    } catch (error) {
      next(error);
    }
  }

  async deleteTenant(req, res, next) {
    try {
      await tenantService.deleteTenant(req.params.id);
      return res.status(HTTP_STATUS.OK).json(successResponse(null, 'Tenant deleted'));
    } catch (error) {
      next(error);
    }
  }

  async getTenantBillingInfo(req, res, next) {
    try {
      const tenantId = req.user.tenantId; // Get tenant ID from authenticated user
      
      // Use the same logic as the admin function to get billing info
      const prisma = await import('../config/db.js').then(m => m.default);
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          subscriptionPlan: true,
          paymentRecords: {
            orderBy: { createdAt: 'desc' },
            take: 10 // Get last 10 payment records
          }
        }
      });

      if (!tenant) {
        const error = new Error('Tenant not found');
        error.statusCode = 404;
        throw error;
      }

      // Calculate effective pricing
      let effectivePrice = tenant.subscriptionPlan?.price || 0;
      
      // Apply custom price if set
      if (tenant.customPrice !== null && tenant.customPrice !== undefined) {
        effectivePrice = tenant.customPrice;
      }
      
      // Apply discounts
      let discountAmount = 0;
      if (tenant.discountPercent !== null && tenant.discountPercent !== undefined) {
        discountAmount += (effectivePrice * tenant.discountPercent) / 100;
      }
      if (tenant.discountFixedAmount !== null && tenant.discountFixedAmount !== undefined) {
        discountAmount += tenant.discountFixedAmount;
      }
      
      // Apply discount expiry
      if (tenant.discountExpiry && new Date() > new Date(tenant.discountExpiry)) {
        discountAmount = 0; // Expired discounts don't apply
      }
      
      const finalPrice = Math.max(0, effectivePrice - discountAmount);

      const billingInfo = {
        tenant,
        currentPlan: tenant.subscriptionPlan,
        effectivePrice,
        discountAmount,
        finalPrice,
        hasActiveDiscount: discountAmount > 0 && (!tenant.discountExpiry || new Date() <= new Date(tenant.discountExpiry)),
      };

      return res.status(HTTP_STATUS.OK).json(
        successResponse(billingInfo, 'Tenant billing information retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }
  
  async getPersonalizedBillingPlans(req, res, next) {
    try {
      const tenantId = req.user.tenantId; // Get tenant ID from authenticated user
      
      // Get the tenant with custom pricing information
      const prisma = await import('../config/db.js').then(m => m.default);
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        const error = new Error('Tenant not found');
        error.statusCode = 404;
        throw error;
      }
      
      // Get all active subscription plans
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
      
      // Calculate personalized pricing for each plan
      const personalizedPlans = plans.map(plan => {
        // Start with the base plan price
        let effectivePrice = plan.price;
        
        // Apply custom price if set for this tenant
        if (tenant.customPrice !== null && tenant.customPrice !== undefined) {
          effectivePrice = tenant.customPrice;
        }
        
        // Apply discounts
        let discountAmount = 0;
        if (tenant.discountPercent !== null && tenant.discountPercent !== undefined) {
          discountAmount += (effectivePrice * tenant.discountPercent) / 100;
        }
        if (tenant.discountFixedAmount !== null && tenant.discountFixedAmount !== undefined) {
          discountAmount += tenant.discountFixedAmount;
        }
        
        // Apply discount expiry
        if (tenant.discountExpiry && new Date() > new Date(tenant.discountExpiry)) {
          discountAmount = 0; // Expired discounts don't apply
        }
        
        const finalPrice = Math.max(0, effectivePrice - discountAmount);
        
        return {
          ...plan,
          originalPrice: plan.price,
          effectivePrice,
          discountAmount,
          finalPrice,
          hasActiveDiscount: discountAmount > 0 && (!tenant.discountExpiry || new Date() <= new Date(tenant.discountExpiry)),
          originalFeatures: plan.features,
          features: plan.features // Keep original features for display
        };
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(personalizedPlans, 'Personalized billing plans retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }
  
  async updateTenantPlan(req, res, next) {
    try {
      const tenantId = req.user.tenantId; // Get tenant ID from authenticated user
      const { subscriptionPlanId } = req.body;
      
      // Validate that the subscription plan exists
      const prisma = await import('../config/db.js').then(m => m.default);
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: subscriptionPlanId }
      });
      
      if (!plan) {
        const error = new Error('Subscription plan not found');
        error.statusCode = 404;
        throw error;
      }
      
      // Update the tenant's subscription plan
      const updatedTenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { subscriptionPlanId },
        include: { subscriptionPlan: true }
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(updatedTenant, 'Tenant plan updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new TenantController();
