import prisma from '../config/db.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import featureSliderService from './featureSlider.service.js';

class TenantService {
  /**
   * Create a new tenant
   */
  async createTenant(data) {
    // Check if subdomain exists
    const existing = await prisma.tenant.findUnique({
      where: { subdomain: data.subdomain },
    });

    if (existing) {
      const error = new Error('Subdomain already exists');
      error.statusCode = HTTP_STATUS.CONFLICT;
      error.code = ERROR_CODES.ALREADY_EXISTS;
      throw error;
    }

    const tenant = await prisma.tenant.create({
      data: {
        ...data,
        status: 'ACTIVE',
        approvalStatus: data.approvalStatus || 'APPROVED', // Default to APPROVED if not specified
      },
    });

    // Initialize default feature slider slides for the new tenant
    try {
      await featureSliderService.initializeDefaultSlides(tenant.id);
    } catch (error) {
      console.error('Failed to initialize default feature slider slides:', error);
      // Don't throw error as this shouldn't prevent tenant creation
    }

    return tenant;
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        subscriptionPlan: true,
        _count: {
          select: {
            users: true,
            documents: true,
            folders: true,
          },
        },
      },
    });

    if (!tenant || tenant.deletedAt) {
      const error = new Error('Tenant not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    return tenant;
  }

  /**
   * Get tenant by subdomain
   */
  async getTenantBySubdomain(subdomain) {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant || tenant.deletedAt) {
      const error = new Error('Tenant not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    return tenant;
  }

  /**
   * Update tenant
   */
  async updateTenant(id, data) {
    const tenant = await prisma.tenant.update({
      where: { id },
      data,
    });

    return tenant;
  }

  /**
   * List all tenants
   */
  async listTenants({ page = 1, limit = 10, status }) {
    const where = { deletedAt: null };
    if (status) where.status = status;

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptionPlan: true,
          _count: {
            select: { users: true, documents: true },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return { tenants, total };
  }

  /**
   * Delete tenant (soft delete)
   */
  async deleteTenant(id) {
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return tenant;
  }

  /**
   * Get project label for a tenant
   */
  async getProjectLabel(tenantId) {
    const tenant = await this.getTenantById(tenantId);
    return tenant.settings?.projectLabel || 'Total Projects';
  }

  /**
   * Update project label for a tenant
   */
  async updateProjectLabel(tenantId, label) {
    // Validate label - allow empty string to reset to default
    if (typeof label !== 'string') {
      const error = new Error('Project label must be a string');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    // Get current tenant settings
    const currentTenant = await this.getTenantById(tenantId);

    // Update tenant settings with new project label
    const updatedTenant = await this.updateTenant(tenantId, {
      settings: {
        ...currentTenant.settings,
        projectLabel: label.trim()
      }
    });

    return label.trim();
  }
}

export default new TenantService();