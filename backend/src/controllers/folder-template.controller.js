import FolderTemplateService from '../services/folder-template.service.js';
import { HTTP_STATUS } from '../constants/index.js';

class FolderTemplateController {
  /**
   * Create a new folder template (Master Admin only)
   */
  async createTemplate(req, res, next) {
    try {
      // Check if user is super admin
      if (!req.user || !req.user.userRoles.some(userRole => userRole.role.name === 'SUPER_ADMIN')) {
        const error = new Error('Only super admins can create templates');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      const { name, industry, description, metadata, nodes } = req.body;

      const template = await FolderTemplateService.createTemplate({
        name,
        industry,
        description,
        metadata,
        nodes,
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all folder templates
   */
  async getAllTemplates(req, res, next) {
    try {
      const { industry, isActive, isSystem, page, limit } = req.query;

      const templates = await FolderTemplateService.getAllTemplates({
        industry: industry || null,
        isActive: isActive !== 'false',
        isSystem: isSystem === 'true' || isSystem === true ? true : 
                 isSystem === 'false' || isSystem === false ? false : null,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req, res, next) {
    try {
      const { id } = req.params;

      const template = await FolderTemplateService.getTemplateById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update template (Master Admin only)
   */
  async updateTemplate(req, res, next) {
    try {
      // Check if user is super admin
      if (!req.user || !req.user.userRoles.some(userRole => userRole.role.name === 'SUPER_ADMIN')) {
        const error = new Error('Only super admins can update templates');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      const { id } = req.params;
      const { name, industry, description, metadata, isActive, nodes } = req.body;

      const template = await FolderTemplateService.updateTemplate(id, {
        name,
        industry,
        description,
        metadata,
        isActive,
        nodes,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete template (Master Admin only)
   */
  async deleteTemplate(req, res, next) {
    try {
      // Check if user is super admin
      if (!req.user || !req.user.userRoles.some(userRole => userRole.role.name === 'SUPER_ADMIN')) {
        const error = new Error('Only super admins can delete templates');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      const { id } = req.params;

      await FolderTemplateService.deleteTemplate(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Apply template to tenant
   */
  async applyTemplateToTenant(req, res, next) {
    try {
      const { id } = req.params;
      const { placeholderValues } = req.body;
      const { tenantId } = req.user;

      // For regular users, they can apply templates to their own tenant
      // For master admins, they might apply to other tenants (if needed)
      
      const result = await FolderTemplateService.applyTemplateToTenant({
        templateId: id,
        tenantId,
        ownerId: req.user.id,
        placeholderValues: placeholderValues || {},
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get templates by industry
   */
  async getTemplatesByIndustry(req, res, next) {
    try {
      const { industry } = req.params;

      const templates = await FolderTemplateService.getTemplatesByIndustry(industry);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FolderTemplateController();