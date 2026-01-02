import tenantService from '../services/tenant.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/response.js';

class TenantController {
  async createTenant(req, res, next) {
    try {
      const tenant = await tenantService.createTenant(req.body);
      return res.status(HTTP_STATUS.CREATED).json(
        successResponse(tenant, 'Tenant created successfully', HTTP_STATUS.CREATED)
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
        status
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({ tenants, total }, 'Tenants retrieved')
      );
    } catch (error) {
      next(error);
    }
  }

  async updateTenant(req, res, next) {
    try {
      const tenant = await tenantService.updateTenant(req.params.id, req.body);
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
  
  async initializeTenantFolders(req, res, next) {
    try {
      const tenantId = req.params.id;
      const initialized = await tenantService.initializeFoldersForExistingTenant(tenantId);
      
      if (initialized) {
        return res.status(HTTP_STATUS.OK).json(successResponse(null, 'Folders initialized successfully'));
      } else {
        return res.status(HTTP_STATUS.OK).json(successResponse(null, 'Folders already exist, no initialization needed'));
      }
    } catch (error) {
      next(error);
    }
  }
  
  async getFolderTemplate(req, res, next) {
    try {
      const template = await tenantService.getFolderTemplate(req.params.id);
      return res.status(HTTP_STATUS.OK).json(successResponse(template, 'Folder template retrieved'));
    } catch (error) {
      next(error);
    }
  }
  
  async updateFolderTemplate(req, res, next) {
    try {
      const template = await tenantService.updateFolderTemplate(req.params.id, req.body.template);
      return res.status(HTTP_STATUS.OK).json(successResponse(template, 'Folder template updated'));
    } catch (error) {
      next(error);
    }
  }
}

export default new TenantController();