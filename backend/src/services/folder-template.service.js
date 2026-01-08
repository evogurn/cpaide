import prisma from '../config/db.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import FolderService from './folder.service.js';

class FolderTemplateService {
  /**
   * Create a new folder template (Master Admin only)
   */
  async createTemplate({ name, industry, description, metadata, nodes, isSystem = false }) {
    const template = await prisma.$transaction(async (tx) => {
      // Create the template
      const createdTemplate = await tx.folderTemplate.create({
        data: {
          name,
          industry,
          description,
          metadata,
          isSystem,
          nodes: {
            create: nodes.map((node, index) => ({
              name: node.name,
              parentId: node.parentId || null,
              level: node.level || 0,
              position: node.position || index,
              isPlaceholder: node.isPlaceholder || false,
              metadata: node.metadata || null,
            })),
          },
        },
        include: {
          nodes: {
            orderBy: { position: 'asc' },
          },
        },
      });

      return createdTemplate;
    });

    return template;
  }

  /**
   * Get all folder templates with optional filters
   */
  async getAllTemplates({ industry = null, isActive = true, isSystem = null, page = 1, limit = 20 }) {
    // Ensure page and limit are valid numbers
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    
    const where = {
      isActive,
      ...(industry && { industry }),
      ...(isSystem !== null && { isSystem }),
    };

    const [templates, total] = await Promise.all([
      prisma.folderTemplate.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          nodes: {
            orderBy: { position: 'asc' },
          },
        },
      }),
      prisma.folderTemplate.count({ where }),
    ]);

    return { templates, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    const template = await prisma.folderTemplate.findUnique({
      where: { id },
      include: {
        nodes: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!template) {
      const error = new Error('Template not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    return template;
  }

  /**
   * Update template (Master Admin only)
   */
  async updateTemplate(id, data) {
    const template = await prisma.folderTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      const error = new Error('Template not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    const { name, industry, description, metadata, isActive, nodes } = data;

    const updatedTemplate = await prisma.$transaction(async (tx) => {
      // Update template basic info
      const updated = await tx.folderTemplate.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(industry !== undefined && { industry }),
          ...(description !== undefined && { description }),
          ...(metadata !== undefined && { metadata }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      // If nodes are provided, update them
      if (nodes !== undefined) {
        // Delete existing nodes
        await tx.folderTemplateNode.deleteMany({
          where: { templateId: id },
        });

        // Create new nodes in level order to handle parent-child relationships
        if (nodes.length > 0) {
          // Create a mapping to track original node IDs to new database IDs
          const originalToNewIdMap = new Map();
          
          // First, create all nodes without parent IDs to get the new database IDs
          const nodesWithNewIds = [];
          for (const node of nodes) {
            const createdNode = await tx.folderTemplateNode.create({
              data: {
                templateId: id,
                name: node.name,
                parentId: null, // Set to null initially
                level: node.level || 0,
                position: node.position || 0,
                isPlaceholder: node.isPlaceholder || false,
                metadata: node.metadata || null,
              },
            });
            
            // Map the original node (with its original id if it had one) to the new database ID
            nodesWithNewIds.push({
              ...node,
              newDbId: createdNode.id
            });
            
            // If the original node had an ID, map it to the new database ID
            if (node.id) {
              originalToNewIdMap.set(node.id, createdNode.id);
            }
          }
          
          // Now update parent IDs based on the mapping
          for (const node of nodesWithNewIds) {
            if (node.parentId) {
              // Check if the parentId corresponds to one of the nodes we just created
              const newParentId = originalToNewIdMap.get(node.parentId);
              if (newParentId) {
                await tx.folderTemplateNode.update({
                  where: { id: node.newDbId },
                  data: { parentId: newParentId },
                });
              }
            }
          }
        }
      }

      // Return updated template with nodes
      return tx.folderTemplate.findUnique({
        where: { id },
        include: {
          nodes: {
            orderBy: { position: 'asc' },
          },
        },
      });
    });

    return updatedTemplate;
  }

  /**
   * Delete template (Master Admin only)
   */
  async deleteTemplate(id) {
    const template = await prisma.folderTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      const error = new Error('Template not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    await prisma.folderTemplate.delete({
      where: { id },
    });

    return { message: 'Template deleted successfully' };
  }

  /**
   * Apply template to tenant - create actual folders based on template
   */
  async applyTemplateToTenant({ templateId, tenantId, ownerId, placeholderValues = {} }) {
    const template = await prisma.folderTemplate.findUnique({
      where: { id: templateId, isActive: true },
      include: {
        nodes: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!template) {
      const error = new Error('Template not found or not active');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      error.code = ERROR_CODES.NOT_FOUND;
      throw error;
    }

    // Build the folder hierarchy from template nodes
    const folderMap = new Map(); // Maps template node ID to created folder ID
    const nodeMap = new Map(); // Maps template node ID to node object

    // First, populate the node map
    template.nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });

    // Create folders in level order to ensure parent folders exist before children
    const levels = [...new Set(template.nodes.map(node => node.level))].sort((a, b) => a - b);
    
    for (const level of levels) {
      const nodesAtLevel = template.nodes.filter(node => node.level === level);
      
      for (const node of nodesAtLevel) {
        // Process folder name - replace placeholders if any
        let folderName = node.name;
        if (node.isPlaceholder) {
          // Replace placeholders in the format {placeholderName}
          const placeholderRegex = /\{([^}]+)\}/g;
          folderName = folderName.replace(placeholderRegex, (match, placeholderName) => {
            return placeholderValues[placeholderName] || match; // Use provided value or keep original placeholder
          });
        }

        // Determine parent folder ID from our mapping
        let parentFolderId = null;
        if (node.parentId) {
          parentFolderId = folderMap.get(node.parentId) || null;
        }

        // Create the actual folder
        const createdFolder = await FolderService.createFolder({
          tenantId,
          name: folderName,
          parentId: parentFolderId,
          ownerId,
          metadata: node.metadata || null,
        });

        // Map the template node ID to the created folder ID
        folderMap.set(node.id, createdFolder.id);
      }
    }

    // Log the template application
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: ownerId,
        action: 'APPLY_FOLDER_TEMPLATE',
        resource: 'folder_template',
        resourceId: templateId,
        metadata: {
          templateName: template.name,
          templateIndustry: template.industry,
          appliedBy: ownerId,
        },
      },
    });

    return {
      message: 'Template applied successfully',
      templateName: template.name,
      foldersCreated: folderMap.size,
    };
  }

  /**
   * Get templates by industry
   */
  async getTemplatesByIndustry(industry) {
    const templates = await prisma.folderTemplate.findMany({
      where: {
        industry: industry,
        isActive: true,
      },
      include: {
        nodes: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return templates;
  }
}

export default new FolderTemplateService();