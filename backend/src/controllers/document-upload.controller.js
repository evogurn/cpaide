import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/response.js';
import documentUploadService from '../services/document-upload.service.js';
import { logger } from '../config/logger.js';

class DocumentUploadController {
  /**
   * Generate presigned URL for document upload with tenant isolation
   */
  async getUploadUrl(req, res, next) {
    try {
      const { fileName, contentType, fileSize } = req.body;
      const tenantId = req.user?.tenantId; // Get tenantId from authenticated user

      // Validate inputs
      if (!fileName) {
        const error = new Error('File name is required');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      if (!contentType) {
        const error = new Error('Content type is required');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      if (!fileSize && fileSize !== 0) {
        const error = new Error('File size is required');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      // Security check: Ensure tenantId exists and matches authenticated user
      if (!tenantId) {
        const error = new Error('Tenant ID not found in authenticated user context');
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Generate presigned URL with tenant isolation
      const { presignedUrl, objectKey } = await documentUploadService.generatePresignedUploadUrl(
        tenantId, 
        fileName, 
        contentType, 
        fileSize
      );

      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          uploadUrl: presignedUrl,
          key: objectKey,
          fileName,
        }, 'Upload URL generated successfully')
      );
    } catch (error) {
      logger.error('Error generating upload URL', { 
        error: error.message, 
        tenantId: req.user?.tenantId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  /**
   * Validate document upload request (for future use)
   */
  async validateUpload(req, res, next) {
    try {
      const { objectKey } = req.body;
      const tenantId = req.user?.tenantId;

      if (!objectKey) {
        const error = new Error('Object key is required');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      if (!tenantId) {
        const error = new Error('Tenant ID not found in authenticated user context');
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Validate that the object key belongs to the authenticated tenant
      const isValid = documentUploadService.validateTenantObjectKey(objectKey, tenantId);
      if (!isValid) {
        const error = new Error('Unauthorized access to object key');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      return res.status(HTTP_STATUS.OK).json(
        successResponse({ valid: true }, 'Upload request validated')
      );
    } catch (error) {
      logger.error('Error validating upload request', { 
        error: error.message, 
        tenantId: req.user?.tenantId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  /**
   * Direct file upload through backend
   */
  async directUpload(req, res, next) {
    try {
      const tenantId = req.user?.tenantId; // Get tenantId from authenticated user
      
      // Check if file was uploaded
      if (!req.file && !req.files) {
        const error = new Error('No file uploaded');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }
      
      const file = req.file || (req.files && req.files[0]);
      
      if (!file) {
        const error = new Error('No file found in request');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }
      
      // Security check: Ensure tenantId exists and matches authenticated user
      if (!tenantId) {
        const error = new Error('Tenant ID not found in authenticated user context');
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }
      
      // Generate a unique document ID
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Use the document upload service to generate secure object key with tenant isolation
      const documentUploadService = await import('../services/document-upload.service.js').then(m => m.default);
      
      // Generate secure object key with tenant isolation
      const objectKey = documentUploadService.generateSecureObjectKey(
        tenantId,
        file.originalname,
        documentId
      );
      
      // Upload file to S3 using file service
      const fileService = await import('../services/file.service.js').then(m => m.default);
      
      // Use the file buffer to upload to S3
      await fileService.uploadFileFromBuffer(file.buffer, objectKey, file.mimetype, tenantId);
      
      // Return success response with the object key
      return res.status(HTTP_STATUS.OK).json(
        successResponse({
          objectKey,
          fileName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
        }, 'File uploaded successfully')
      );
    } catch (error) {
      logger.error('Error in direct file upload', { 
        error: error.message, 
        tenantId: req.user?.tenantId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new DocumentUploadController();