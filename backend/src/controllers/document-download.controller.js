import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/response.js';
import documentDownloadService from '../services/document-download.service.js';
import { logger } from '../config/logger.js';

class DocumentDownloadController {
  /**
   * Generate presigned download URL for a document with tenant isolation and role-based access
   */
  async getDownloadUrl(req, res, next) {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;
      const userTenantId = req.user?.tenantId;
      const userRoles = req.user?.userRoles?.map(ur => ur.role.name) || [];

      // Validate inputs
      if (!documentId) {
        const error = new Error('Document ID is required');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      if (!userId || !userTenantId) {
        const error = new Error('User authentication information is missing');
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Generate presigned download URL with all validations
      const downloadInfo = await documentDownloadService.generatePresignedDownloadUrl(
        documentId,
        userId,
        userTenantId,
        userRoles
      );

      return res.status(HTTP_STATUS.OK).json(
        successResponse(downloadInfo, 'Download URL generated successfully')
      );
    } catch (error) {
      logger.error('Error generating download URL', { 
        error: error.message, 
        documentId: req.params.documentId,
        userId: req.user?.id,
        userTenantId: req.user?.tenantId 
      });
      
      // Handle specific error types
      if (error.message === 'Document not found or access denied') {
        const authError = new Error('Unauthorized: Document not found or access denied');
        authError.statusCode = HTTP_STATUS.FORBIDDEN;
        return next(authError);
      }
      
      if (error.message === 'Invalid S3 key for tenant') {
        const authError = new Error('Unauthorized: Invalid document location');
        authError.statusCode = HTTP_STATUS.FORBIDDEN;
        return next(authError);
      }

      next(error);
    }
  }

  /**
   * Validate document access without generating download URL
   */
  async validateAccess(req, res, next) {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;
      const userTenantId = req.user?.tenantId;
      const userRoles = req.user?.userRoles?.map(ur => ur.role.name) || [];

      // Validate inputs
      if (!documentId) {
        const error = new Error('Document ID is required');
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }

      if (!userId || !userTenantId) {
        const error = new Error('User authentication information is missing');
        error.statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Validate document access
      const hasAccess = await documentDownloadService.validateDocumentExists(
        documentId,
        userId,
        userTenantId,
        userRoles
      );

      if (!hasAccess) {
        const error = new Error('Document not found or access denied');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      return res.status(HTTP_STATUS.OK).json(
        successResponse({ valid: true }, 'Document access validated')
      );
    } catch (error) {
      logger.error('Error validating document access', { 
        error: error.message, 
        documentId: req.params.documentId,
        userId: req.user?.id,
        userTenantId: req.user?.tenantId 
      });
      
      if (error.message.includes('access denied')) {
        error.statusCode = HTTP_STATUS.FORBIDDEN;
      }
      
      next(error);
    }
  }
}

export default new DocumentDownloadController();