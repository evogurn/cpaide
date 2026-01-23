import folderService from '../services/folder.service.js';
import notificationService from '../services/notification.service.js';
import prisma from '../config/db.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse, paginationMeta } from '../utils/response.js';

class FolderController {
  async createFolder(req, res, next) {
    try {
      const folder = await folderService.createFolder({
        ...req.body,
        tenantId: req.tenantId,
        ownerId: req.userId,
      });
      
      // Send notification to tenant admin about staff folder creation
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.userId }
        });
        
        const tenant = await prisma.tenant.findUnique({
          where: { id: req.tenantId }
        });
        
        if (user && tenant) {
          await notificationService.sendStaffFolderCreatedNotification(folder, user, tenant);
        }
      } catch (notificationError) {
        console.error('Failed to send folder creation notification:', notificationError);
      }
      
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
      const folder = await folderService.updateFolder(req.params.id, req.tenantId, req.body);
      return res.status(HTTP_STATUS.OK).json(successResponse(folder, 'Folder updated'));
    } catch (error) {
      next(error);
    }
  }

  async renameFolder(req, res, next) {
    try {
      // Get current folder name for notification
      const currentFolder = await prisma.folder.findUnique({
        where: { id: req.params.id }
      });
      
      const folder = await folderService.renameFolder(req.params.id, req.tenantId, req.body.name);
      
      // Send notification to tenant admin about staff folder renaming
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.userId }
        });
        
        const tenant = await prisma.tenant.findUnique({
          where: { id: req.tenantId }
        });
        
        if (user && tenant && currentFolder) {
          await notificationService.sendStaffFolderRenamedNotification(folder, user, tenant, currentFolder.name);
        }
      } catch (notificationError) {
        console.error('Failed to send folder rename notification:', notificationError);
      }
      
      return res.status(HTTP_STATUS.OK).json(successResponse(folder, 'Folder renamed'));
    } catch (error) {
      next(error);
    }
  }

  async moveFolder(req, res, next) {
    try {
      // Get folder and parent folder names for notification
      const folder = await prisma.folder.findUnique({
        where: { id: req.params.id },
        include: { parent: true }
      });
      
      const targetParent = req.body.targetParentId ? 
        await prisma.folder.findUnique({
          where: { id: req.body.targetParentId }
        }) : null;
      
      const result = await folderService.moveFolder(
        req.params.id,
        req.tenantId,
        req.body.targetParentId
      );
      
      // Send notification to tenant admin about staff folder moving
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.userId }
        });
        
        const tenant = await prisma.tenant.findUnique({
          where: { id: req.tenantId }
        });
        
        if (user && tenant && folder) {
          const oldParentName = folder.parent ? folder.parent.name : 'Root';
          const newParentName = targetParent ? targetParent.name : 'Root';
          
          await notificationService.sendStaffFolderMovedNotification(
            result, 
            user, 
            tenant, 
            oldParentName, 
            newParentName
          );
        }
      } catch (notificationError) {
        console.error('Failed to send folder move notification:', notificationError);
      }
      
      return res.status(HTTP_STATUS.OK).json(successResponse(result, 'Folder moved'));
    } catch (error) {
      next(error);
    }
  }

  async deleteFolder(req, res, next) {
    try {
      // Get folder name before deletion for notification
      const folderToDelete = await prisma.folder.findUnique({
        where: { id: req.params.id }
      });
      
      const result = await folderService.deleteFolder(req.params.id, req.tenantId);
      
      // Send notification to tenant admin about staff folder deletion
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.userId }
        });
        
        const tenant = await prisma.tenant.findUnique({
          where: { id: req.tenantId }
        });
        
        if (user && tenant && folderToDelete) {
          await notificationService.sendStaffFolderDeletedNotification(folderToDelete.name, user, tenant);
        }
      } catch (notificationError) {
        console.error('Failed to send folder deletion notification:', notificationError);
      }
      
      return res.status(HTTP_STATUS.OK).json(successResponse(result, 'Folder deleted'));
    } catch (error) {
      next(error);
    }
  }

  async getFolderTree(req, res, next) {
    try {
      const tree = await folderService.getFolderTree(req.tenantId);
      return res.status(HTTP_STATUS.OK).json(successResponse(tree, 'Folder tree retrieved'));
    } catch (error) {
      next(error);
    }
  }
}

export default new FolderController();
