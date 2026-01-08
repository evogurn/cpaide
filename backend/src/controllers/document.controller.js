import documentService from '../services/document.service.js';
import fileService from '../services/file.service.js';
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
      
      const uniqueFileName = generateUniqueFilename(fileName);
      // Generate the storage key using a proper document ID
      // This will be a temporary ID until the document is created in the database
      const tempDocumentId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const storageKey = getStorageKey(tenantId, uniqueFileName, tempDocumentId, 'raw');
      
      const { uploadUrl, key } = await fileService.getUploadUrl(storageKey, contentType, tenantId);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          uploadUrl,
          key,
          fileName: uniqueFileName,
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
      
      // If we have a documentId from the storage key and it's different from the created document ID,
      // we might want to update the storage key to use the actual document ID
      if (documentId && documentId.startsWith('temp_')) {
        // If the original storage key used a temp ID, we could update it here if needed
        // For now, we'll keep the original storage key as is
      }
      
      return res.status(HTTP_STATUS.CREATED).json(
        successResponse(document, 'Document created successfully', HTTP_STATUS.CREATED)
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
      const document = await documentService.renameDocument(id, req.tenantId, req.body.name);
      
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
      
      const document = await documentService.moveDocument(id, req.tenantId, targetFolderId);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(document, 'Document moved')
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
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({ downloadUrl }, 'Download URL generated')
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new DocumentController();
