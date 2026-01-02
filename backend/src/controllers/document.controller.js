import documentService from '../services/document.service.js';
import fileService from '../services/file.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/response.js';
import { paginate, paginationMeta } from '../utils/response.js';
import { getStorageKey, generateUniqueFilename } from '../utils/file.js';

class DocumentController {
  /**
   * Get pre-signed upload URL
   */
  async getUploadUrl(req, res, next) {
    try {
      const { fileName, contentType } = req.body;
      const tenantId = req.tenantId;
      
      const uniqueFileName = generateUniqueFilename(fileName);
      const storageKey = getStorageKey(tenantId, uniqueFileName);
      
      const { uploadUrl, key } = await fileService.getUploadUrl(storageKey, contentType);
      
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
      const result = await documentService.deleteDocument(id, req.tenantId);
      
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
      
      const { downloadUrl } = await fileService.getDownloadUrl(document.storageKey);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({ downloadUrl }, 'Download URL generated')
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new DocumentController();
