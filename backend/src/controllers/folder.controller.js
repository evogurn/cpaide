import folderService from '../services/folder.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse, paginationMeta } from '../utils/response.js';

class FolderController {
  async createFolder(req, res, next) {
    try {
      console.log('Folder creation request:', req.body, req.tenantId, req.userId);
      const folder = await folderService.createFolder({
        ...req.body,
        tenantId: req.tenantId,
        ownerId: req.userId,
      });
      
      return res.status(HTTP_STATUS.CREATED).json(
        successResponse(folder, 'Folder created', HTTP_STATUS.CREATED)
      );
    } catch (error) {
      next(error);
    }
  }

  async getFolder(req, res, next) {
    try {
      const folder = await folderService.getFolderById(req.params.id, req.tenantId);
      return res.status(HTTP_STATUS.OK).json(successResponse(folder, 'Folder retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async listFolders(req, res, next) {
    try {
      const { page = 1, limit = 50, parentId } = req.query;
      const { folders, total } = await folderService.listFolders({
        tenantId: req.tenantId,
        parentId: parentId || null,
        page: parseInt(page),
        limit: parseInt(limit),
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          folders,
          pagination: paginationMeta(total, parseInt(page), parseInt(limit)),
        }, 'Folders retrieved')
      );
    } catch (error) {
      next(error);
    }
  }

  async updateFolder(req, res, next) {
    try {
      console.log('Folder update request:', req.params.id, req.tenantId, req.body);
      const folder = await folderService.updateFolder(req.params.id, req.tenantId, req.body);
      return res.status(HTTP_STATUS.OK).json(successResponse(folder, 'Folder updated'));
    } catch (error) {
      next(error);
    }
  }

  async moveFolder(req, res, next) {
    try {
      console.log('Folder move request:', req.params.id, req.tenantId, req.body);
      const folder = await folderService.moveFolder(
        req.params.id,
        req.tenantId,
        req.body.targetParentId
      );
      return res.status(HTTP_STATUS.OK).json(successResponse(folder, 'Folder moved'));
    } catch (error) {
      next(error);
    }
  }

  async deleteFolder(req, res, next) {
    try {
      console.log('Folder delete request:', req.params.id, req.tenantId);
      const result = await folderService.deleteFolder(req.params.id, req.tenantId);
      return res.status(HTTP_STATUS.OK).json(successResponse(result, 'Folder deleted'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all folders for tenant as flat list
   */
  async getAllFolders(req, res, next) {
    try {
      console.log('Getting all folders for tenant:', req.tenantId);
      const folders = await folderService.getAllFoldersForTenant(req.tenantId);
      console.log('Returning folders count:', folders.length);
      return res.status(HTTP_STATUS.OK).json(successResponse({ folders }, 'All folders retrieved'));
    } catch (error) {
      next(error);
    }
  }
}

export default new FolderController();
