import prisma from '../config/db.js';
import emailService from '../services/email.service.js';
import notificationService from '../services/notification.service.js';
import { successResponse } from '../utils/response.js';


/**
 * Admin Dashboard - Get system statistics
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    // Get system statistics
    const [
      totalTenants,
      totalUsers,
      totalDocuments,
      totalFolders,
      pendingTenants,
      activeTenants
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.document.count(),
      prisma.folder.count(),
      prisma.tenant.count({
        where: { approvalStatus: 'PENDING' }
      }),
      prisma.tenant.count({
        where: { status: 'ACTIVE' }
      })
    ]);

    const dashboardData = {
      totalTenants,
      totalUsers,
      totalDocuments,
      totalFolders,
      pendingTenants,
      activeTenants,
      systemInfo: {
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(
      successResponse(dashboardData, 'Admin dashboard data retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tenants with pagination
 */
export const getAllTenants = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, approvalStatus } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};
    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      whereClause.status = status;
    }
    if (approvalStatus) {
      whereClause.approvalStatus = approvalStatus;
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true
            }
          },
          subscriptionPlan: true,
          approvedByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tenant.count({ where: whereClause })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    };

    return res.status(200).json(
      successResponse({ tenants, pagination }, 'Tenants retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update tenant status
 */
export const updateTenantStatus = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { status } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { status }
    });

    return res.status(200).json(
      successResponse(tenant, 'Tenant status updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with pagination
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, tenantId, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          tenant: {
            select: {
              id: true,
              name: true
            }
          },
          userRoles: {
            include: {
              role: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    };

    return res.status(200).json(
      successResponse({ users, pagination }, 'Users retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    return res.status(200).json(
      successResponse(user, 'User status updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a tenant
 */
export const approveTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const adminUserId = req.user.id;

    // Get admin user details
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId }
    });

    if (!adminUser) {
      const error = new Error('Admin user not found');
      error.statusCode = 404;
      throw error;
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminUserId,
      },
      include: {
        approvedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Send notification to tenant admin
    try {
      // Send notification
      await notificationService.sendTenantApprovalNotification(tenant, adminUser);
      
      // Send welcome email
      console.log(`Looking for tenant admin for tenant ID: ${tenant.id}`);
      const tenantAdmin = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          userRoles: {
            some: {
              role: {
                name: 'TENANT_ADMIN'
              }
            }
          }
        },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      console.log(`Found tenant admin: ${!!tenantAdmin}`, { tenantAdmin: tenantAdmin ? { id: tenantAdmin.id, email: tenantAdmin.email, roles: tenantAdmin.userRoles?.map(ur => ur.role?.name) } : null });
      
      if (tenantAdmin) {
        console.log("Sending welcome email to tenant admin");
        const emailResult = await emailService.sendWelcomeEmail(tenantAdmin, tenant);
        console.log("Welcome email result:", emailResult);
        await emailService.sendTenantApprovalNotification(tenant, adminUser);
      } else {
        console.log("No tenant admin found - welcome email not sent");
      }
    } catch (notificationError) {
      console.error('Failed to send approval notification:', notificationError);
      // Don't fail the approval process if notification fails
    }

    return res.status(200).json(
      successResponse(tenant, 'Tenant approved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a tenant
 */
export const rejectTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const adminUserId = req.user.id;
    const { reason } = req.body; // Optional reason for rejection

    // Get admin user details
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId }
    });

    if (!adminUser) {
      const error = new Error('Admin user not found');
      error.statusCode = 404;
      throw error;
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        approvalStatus: 'REJECTED',
        approvedAt: new Date(),
        approvedBy: adminUserId,
      },
      include: {
        approvedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Send rejection notification to tenant admin
    try {
      // Send notification
      await notificationService.sendTenantRejectionNotification(tenant, adminUser, reason);
      
      // Send rejection email
      const tenantAdmin = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          userRoles: {
            some: {
              role: {
                name: 'TENANT_ADMIN'
              }
            }
          }
        }
      });

      if (tenantAdmin) {
        await emailService.sendTenantRejectionNotification(tenant, adminUser, reason);
      }
    } catch (notificationError) {
      console.error('Failed to send rejection notification:', notificationError);
      // Don't fail the rejection process if notification fails
    }

    return res.status(200).json(
      successResponse(tenant, 'Tenant rejected successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending tenants
 */
export const getPendingTenants = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { approvalStatus: 'PENDING' };
    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true
            }
          },
          subscriptionPlan: true,
          approvedByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tenant.count({ where: whereClause })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    };

    return res.status(200).json(
      successResponse({ tenants, pagination }, 'Pending tenants retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update tenant details
 */
export const updateTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { name, subdomain, status, approvalStatus, subscriptionPlanId } = req.body;
    
    // Get the current tenant to check if approval status is changing
    const currentTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    // Check if subdomain already exists for another tenant
    if (subdomain) {
      const existingTenant = await prisma.tenant.findUnique({
        where: { subdomain },
      });

      if (existingTenant && existingTenant.id !== tenantId) {
        const error = new Error('Subdomain already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(name && { name }),
        ...(subdomain && { subdomain }),
        ...(status && { status }),
        ...(approvalStatus && { 
          approvalStatus,
          ...(approvalStatus === 'APPROVED' && {
            approvedAt: new Date(),
            approvedBy: req.user.id,
          })
        }),
        ...(subscriptionPlanId && subscriptionPlanId.trim() !== '' && { subscriptionPlanId }),
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true
          }
        },
        subscriptionPlan: true,
        approvedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // If approval status was changed to APPROVED, send welcome email and notification
    const approvalStatusChanged = currentTenant && currentTenant.approvalStatus !== approvalStatus;
    if (approvalStatus === 'APPROVED' && approvalStatusChanged) {
      try {
        // Send notification to tenant admin
        await notificationService.sendTenantApprovalNotification(updatedTenant, req.user);
        
        // Send welcome email to tenant admin
        const tenantAdmin = await prisma.user.findFirst({
          where: {
            tenantId: updatedTenant.id,
            userRoles: {
              some: {
                role: {
                  name: 'TENANT_ADMIN'
                }
              }
            }
          },
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        });

        if (tenantAdmin) {
          console.log("Sending welcome email to tenant admin via updateTenant");
          const emailResult = await emailService.sendWelcomeEmail(tenantAdmin, updatedTenant);
          console.log("Welcome email result:", emailResult);
          await emailService.sendTenantApprovalNotification(updatedTenant, req.user);
        } else {
          console.log("No tenant admin found - welcome email not sent via updateTenant");
        }
      } catch (notificationError) {
        console.error('Failed to send approval notification from updateTenant:', notificationError);
        // Don't fail the update process if notification fails
      }
    }

    return res.status(200).json(
      successResponse(updatedTenant, 'Tenant updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all billing plans
 */
export const getAllBillingPlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};
    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const [plans, total] = await Promise.all([
      prisma.subscriptionPlan.findMany({
        where: whereClause,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.subscriptionPlan.count({ where: whereClause })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    };

    return res.status(200).json(
      successResponse({ plans, pagination }, 'Billing plans retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available billing plans (public endpoint)
 */
export const getAvailableBillingPlans = async (req, res, next) => {
  try {
    const { search } = req.query;

    const whereClause = {
      isActive: true, // Only return active plans
    };
    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(
      successResponse(plans, 'Available billing plans retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update a billing plan
 */
export const upsertBillingPlan = async (req, res, next) => {
  try {
    const { id, name, displayName, description, price, currency, interval, features, limits, isActive } = req.body;

    let plan;
    if (id) {
      // Update existing plan
      plan = await prisma.subscriptionPlan.update({
        where: { id },
        data: {
          name,
          displayName,
          description,
          price,
          currency,
          interval,
          features,
          limits,
          isActive,
        },
      });
    } else {
      // Create new plan
      plan = await prisma.subscriptionPlan.create({
        data: {
          name,
          displayName,
          description,
          price,
          currency,
          interval,
          features,
          limits,
          isActive,
        },
      });
    }

    return res.status(200).json(
      successResponse(plan, id ? 'Billing plan updated successfully' : 'Billing plan created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a billing plan
 */
export const deleteBillingPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;

    // Check if plan is being used by any tenants
    const planWithTenants = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        tenants: {
          select: { id: true }
        }
      }
    });

    if (planWithTenants && planWithTenants.tenants.length > 0) {
      const error = new Error('Cannot delete billing plan that is assigned to tenants');
      error.statusCode = 400;
      throw error;
    }

    await prisma.subscriptionPlan.delete({
      where: { id: planId }
    });

    return res.status(200).json(
      successResponse(null, 'Billing plan deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update tenant custom pricing
 */
export const updateTenantPricing = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { customPrice, discountPercent, discountFixedAmount, discountCode, discountExpiry, subscriptionPlanId } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        customPrice: customPrice !== undefined ? customPrice : undefined,
        discountPercent: discountPercent !== undefined ? discountPercent : undefined,
        discountFixedAmount: discountFixedAmount !== undefined ? discountFixedAmount : undefined,
        discountCode: discountCode !== undefined ? discountCode : undefined,
        discountExpiry: discountExpiry !== undefined ? new Date(discountExpiry) : undefined,
        ...(subscriptionPlanId && subscriptionPlanId.trim() !== '' && { subscriptionPlanId }),
      },
      include: {
        subscriptionPlan: true,
      }
    });

    return res.status(200).json(
      successResponse(tenant, 'Tenant pricing updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant billing information
 */
export const getTenantBillingInfo = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

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

    return res.status(200).json(
      successResponse(billingInfo, 'Tenant billing information retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
