import documentService from '../services/document.service.js';
import fileService from '../services/file.service.js';
import documentUploadService from '../services/document-upload.service.js';
import notificationService from '../services/notification.service.js';
import prisma from '../config/db.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/response.js';
import { paginate, paginationMeta } from '../utils/response.js';
import { getStorageKey, generateUniqueFilename } from '../utils/file.js';
import { logger } from '../config/logger.js';

class DocumentController {
  /**
   * Get pre-signed upload URL
   */
  async getUploadUrl(req, res, next) {
    try {
      const { fileName, contentType } = req.body;
      const tenantId = req.tenantId;
      
      // Generate the storage key using a proper document ID
      // This will be a temporary ID until the document is created in the database
      const tempDocumentId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Use the document upload service to generate secure object key with tenant isolation
      const { presignedUrl: uploadUrl, objectKey: key } = await documentUploadService.generatePresignedUploadUrl(
        tenantId,
        fileName,
        contentType,
        0, // fileSize - not available yet
        tempDocumentId
      );
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          uploadUrl,
          key,
          fileName,
        }, 'Upload URL generated')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create document metadata after upload
   */
  async createDocument(req, res, next) {
    try {
      const { name, originalName, mimeType, size, folderId, tags, metadata, storageKey } = req.body;
      
      // Extract documentId from storageKey if it exists
      let documentId = null;
      if (storageKey) {
        // Extract documentId from the storage key path: tenants/{tenantId}/documents/raw/{documentId}/{filename}
        const pathParts = storageKey.split('/');
        if (pathParts.length >= 5 && pathParts[3] === 'raw') {
          documentId = pathParts[4];
        }
      }
      
      const document = await documentService.createDocument({
        tenantId: req.tenantId,
        folderId,
        ownerId: req.userId,
        name,
        originalName,
        mimeType,
        size,
        tags,
        metadata,
        storageKey,
      });
      
      // Send notification to tenant admin about staff document upload
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.userId }
        });
        
        const tenant = await prisma.tenant.findUnique({
          where: { id: req.tenantId }
        });
        
        if (user && tenant) {
          await notificationService.sendStaffDocumentUploadedNotification(document, user, tenant);
        }
      } catch (notificationError) {
        console.error('Failed to send document upload notification:', notificationError);
      }
      
      // If we have a documentId from the storage key and it's different from the created document ID,
      // we might want to update the storage key to use the actual document ID
      if (documentId && documentId.startsWith('temp_')) {
        // If the original storage key used a temp ID, we could update it here if needed
        // For now, we'll keep the original storage key as is
      }
      
      // Convert BigInt values to Numbers for JSON serialization
      const serializedDocument = JSON.parse(JSON.stringify(document, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
      ));
      
      return res.status(HTTP_STATUS.CREATED).json(
        successResponse(serializedDocument, 'Document created successfully', HTTP_STATUS.CREATED)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocumentById(id, req.tenantId);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(document, 'Document retrieved')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List documents
   */
  async listDocuments(req, res, next) {
    try {
      const { page = 1, limit = 20, folderId, status, tags } = req.query;
      
      const { documents, total } = await documentService.listDocuments({
        tenantId: req.tenantId,
        folderId,
        status,
        tags: tags ? tags.split(',') : undefined,
        page: parseInt(page),
        limit: parseInt(limit),
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          documents,
          pagination: paginationMeta(total, parseInt(page), parseInt(limit)),
        }, 'Documents retrieved')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(req, res, next) {
    try {
      const { query, page = 1, limit = 20, folderId, status, tags } = req.query;
      
      const { documents, total } = await documentService.searchDocuments({
        tenantId: req.tenantId,
        query,
        folderId,
        status,
        tags: tags ? tags.split(',') : undefined,
        page: parseInt(page),
        limit: parseInt(limit),
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          documents,
          pagination: paginationMeta(total, parseInt(page), parseInt(limit)),
        }, 'Search results')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update document
   */
  async updateDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.updateDocument(id, req.tenantId, req.body);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(document, 'Document updated')
      );
    } catch (error) {
      next(error);
    }
  }

  async renameDocument(req, res, next) {
    try {
      const { id } = req.params;
      
      // Get current document name for notification
      const currentDocument = await prisma.document.findUnique({
        where: { id }
      });
      
      const document = await documentService.renameDocument(id, req.tenantId, req.body.name);
      
      // Send notification to tenant admin about staff document renaming
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.userId }
        });
        
        const tenant = await prisma.tenant.findUnique({
          where: { id: req.tenantId }
        });
        
        if (user && tenant && currentDocument) {
          await notificationService.sendStaffDocumentRenamedNotification(document, user, tenant, currentDocument.name);
        }
      } catch (notificationError) {
        console.error('Failed to send document rename notification:', notificationError);
      }
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(document, 'Document renamed')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Move document
   */
  async moveDocument(req, res, next) {
    try {
      const { id } = req.params;
      const { targetFolderId } = req.body;
      
      // Get document and folder names for notification
      const document = await prisma.document.findUnique({
        where: { id },
        include: { folder: true }
      });
      
      const targetFolder = targetFolderId ? 
        await prisma.folder.findUnique({
          where: { id: targetFolderId }
        }) : null;
      
      const result = await documentService.moveDocument(id, req.tenantId, targetFolderId);
      
      // Send notification to tenant admin about staff document moving
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.userId }
        });
        
        const tenant = await prisma.tenant.findUnique({
          where: { id: req.tenantId }
        });
        
        if (user && tenant && document) {
          const oldFolderName = document.folder ? document.folder.name : 'Root';
          const newFolderName = targetFolder ? targetFolder.name : 'Root';
          
          await notificationService.sendStaffDocumentMovedNotification(
            result, 
            user, 
            tenant, 
            oldFolderName, 
            newFolderName
          );
        }
      } catch (notificationError) {
        console.error('Failed to send document move notification:', notificationError);
      }
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Document moved')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocumentById(id, req.tenantId); // Verify document belongs to tenant first
      
      // Send notification to tenant admin about staff document deletion
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.userId }
        });
        
        const tenant = await prisma.tenant.findUnique({
          where: { id: req.tenantId }
        });
        
        if (user && tenant && document) {
          await notificationService.sendStaffDocumentDeletedNotification(document.name, user, tenant);
        }
      } catch (notificationError) {
        console.error('Failed to send document deletion notification:', notificationError);
      }
      
      const result = await documentService.deleteDocument(id, req.tenantId);
      
      // Also delete the file from S3 storage
      if (document.storageKey) {
        try {
          await fileService.deleteFile(document.storageKey, req.tenantId);
        } catch (s3Error) {
          logger.error('Failed to delete file from S3', { 
            storageKey: document.storageKey, 
            error: s3Error.message 
          });
          // Don't fail the operation if S3 deletion fails, but log it
        }
      }
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Document deleted')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore document
   */
  async restoreDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.restoreDocument(id, req.tenantId);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(document, 'Document restored')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get download URL
   */
  async getDownloadUrl(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocumentById(id, req.tenantId);
      
      const { downloadUrl } = await fileService.getDownloadUrl(document.storageKey, req.tenantId);
      
      // Log the download activity in the audit log and update document metadata
      try {
        await prisma.auditLog.create({
          data: {
            tenantId: req.tenantId,
            userId: req.user?.id,
            action: 'DOWNLOAD',
            resource: 'DOCUMENT',
            resourceId: id,
            metadata: {
              name: document.name,
              storageKey: document.storageKey,
              downloadUrl: downloadUrl
            }
          }
        });

        // Update document metadata with last download info
        const currentMetadata = document.metadata || {};
        await prisma.document.update({
          where: { id },
          data: {
            metadata: {
              ...currentMetadata,
              lastDownloadUrl: downloadUrl,
              lastDownloadedAt: new Date(),
              lastDownloadedBy: req.user?.id
            }
          }
        });
      } catch (dbError) {
        logger.error('Failed to log download activity', { error: dbError.message });
      }

      return res.status(HTTP_STATUS.OK).json(
        successResponse({ downloadUrl }, 'Download URL generated')
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new DocumentController();
