import prisma from '../config/db.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import featureSliderService from './featureSlider.service.js';

class TenantService {
  /**
   * Create a new tenant
   */
  async createTenant(data) {
    console.log('Creating tenant with data:', data);
    
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
      },
    });
    
    console.log('Created tenant:', tenant);

    // Initialize default feature slider slides for the new tenant
    try {
      await featureSliderService.initializeDefaultSlides(tenant.id);
    } catch (error) {
      console.error('Failed to initialize default feature slider slides:', error);
      // Don't throw error as this shouldn't prevent tenant creation
    }

    // Initialize folders from template
    try {
      console.log('Initializing folders from template for tenant:', tenant.id);
      await this.initializeFoldersFromTemplate(tenant.id);
      console.log('Finished initializing folders from template for tenant:', tenant.id);
    } catch (error) {
      console.error('Failed to initialize folders from template:', error);
      // Don't throw error as this shouldn't prevent tenant creation
    }

    return tenant;
  }

  /**
   * Initialize folders from template for a tenant
   */
  async initializeFoldersFromTemplate(tenantId) {
    console.log('Getting folder template for tenant:', tenantId);
    const template = await this.getFolderTemplate(tenantId);
    console.log('Folder template for tenant:', tenantId, JSON.stringify(template, null, 2));
    
    // Create folders from template
    const createFolders = async (folderTemplate, parentId = null, parentPath = '') => {
      for (const folderData of folderTemplate) {
        const folderPath = parentPath ? `${parentPath}/${folderData.name}` : `/${folderData.name}`;
        
        try {
          console.log('Creating folder:', { tenantId, name: folderData.name, parentId, path: folderPath });
          // Create folder
          const folder = await prisma.folder.create({
            data: {
              tenantId,
              name: folderData.name,
              parentId,
              path: folderPath,
              ownerId: null, // Will be set when user is created
            },
          });
          console.log('Created folder:', folder);

          // Recursively create children
          if (folderData.children && folderData.children.length > 0) {
            await createFolders(folderData.children, folder.id, folderPath);
          }
        } catch (error) {
          console.error(`Failed to create folder ${folderData.name}:`, error);
          throw error;
        }
      }
    };

    await createFolders(template);
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

    if (!tenant) {
      const error = new Error('Tenant not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    return tenant;
  }

  /**
   * List tenants
   */
  async listTenants({ page = 1, limit = 10, status }) {
    const where = {};
    if (status) {
      where.status = status;
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.tenant.count({ where }),
    ]);

    return { tenants, total };
  }

  /**
   * Update tenant
   */
  async updateTenant(id, data) {
    // Prevent updating critical fields
    const { id: _, createdAt: __, updatedAt: ___, ...updateData } = data;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
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

    return tenant;
  }

  /**
   * Delete tenant (soft delete)
   */
  async deleteTenant(id) {
    await prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get folder template for tenant
   */
  async getFolderTemplate(tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      const error = new Error('Tenant not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Return folder template from settings or default template
    const defaultTemplate = [
      {
        "id": "city",
        "name": "City",
        "children": [
          {
            "id": "community",
            "name": "Community",
            "children": [
              {
                "id": "lot-27",
                "name": "Lot 27",
                "children": [
                  {
                    "id": "custom",
                    "name": "Custom",
                    "children": [
                      {
                        "id": "site-survey",
                        "name": "Site Survey",
                        "children": []
                      },
                      {
                        "id": "floor-plan",
                        "name": "Floor Plan",
                        "children": []
                      },
                      {
                        "id": "hvac",
                        "name": "HVAC",
                        "children": []
                      },
                      {
                        "id": "buyer-docs",
                        "name": "Buyer Docs",
                        "children": []
                      },
                      {
                        "id": "invoices",
                        "name": "Invoices",
                        "children": []
                      },
                      {
                        "id": "specifications",
                        "name": "Specifications",
                        "children": []
                      },
                      {
                        "id": "warranty",
                        "name": "Warranty",
                        "children": []
                      },
                      {
                        "id": "inspection-reports",
                        "name": "Inspection Reports",
                        "children": []
                      },
                      {
                        "id": "photos",
                        "name": "Photos",
                        "children": []
                      },
                      {
                        "id": "contracts",
                        "name": "Contracts",
                        "children": []
                      },
                      {
                        "id": "selections",
                        "name": "Selections",
                        "children": []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    return tenant.settings?.folderTemplate || defaultTemplate;
  }

  /**
   * Update folder template for tenant
   */
  async updateFolderTemplate(tenantId, template) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      const error = new Error('Tenant not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Validate template structure
    if (!Array.isArray(template)) {
      const error = new Error('Invalid folder template format');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.code = ERROR_CODES.BAD_REQUEST;
      throw error;
    }

    // Update tenant settings with new folder template
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...tenant.settings,
          folderTemplate: template
        }
      }
    });

    return updatedTenant.settings.folderTemplate;
  }
  
  /**
   * Initialize folders for existing tenant (if they don't exist)
   */
  async initializeFoldersForExistingTenant(tenantId) {
    // Check if folders already exist for this tenant
    const existingFolders = await prisma.folder.findMany({
      where: { tenantId, deletedAt: null },
      take: 1
    });
    
    // If no folders exist, initialize them
    if (existingFolders.length === 0) {
      console.log('No existing folders found for tenant, initializing from template:', tenantId);
      await this.initializeFoldersFromTemplate(tenantId);
      return true;
    }
    
    console.log('Folders already exist for tenant, skipping initialization:', tenantId);
    return false;
  }

  /**
   * Get project label for tenant from settings
   * @param {string} tenantId - The tenant ID
   * @returns {Promise<string>} The project label
   */
  async getProjectLabel(tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      const error = new Error('Tenant not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Return project label from settings or default value
    return tenant.settings?.projectLabel || 'Project';
  }

  /**
   * Update project label for tenant in settings
   * @param {string} tenantId - The tenant ID
   * @param {string} label - The new project label
   * @returns {Promise<string>} The updated project label
   */
  async updateProjectLabel(tenantId, label) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      const error = new Error('Tenant not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Update tenant settings with new project label
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...tenant.settings,
          projectLabel: label
        }
      }
    });

    return updatedTenant.settings.projectLabel;
  }
}

export default new TenantService();