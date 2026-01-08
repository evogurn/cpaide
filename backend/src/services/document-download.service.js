import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import prisma from '../config/db.js';

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

class DocumentDownloadService {
  /**
   * Validate that the user has permission to access the document
   * @param {string} documentId - The document ID
   * @param {string} userId - The user ID from JWT
   * @param {string} userTenantId - The user's tenant ID from JWT
   * @param {Array<string>} userRoles - The user's roles from JWT
   * @returns {Promise<Object>} The document object if access is granted
   */
  async validateDocumentAccess(documentId, userId, userTenantId, userRoles) {
    // Fetch document metadata from database
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        tenantId: userTenantId, // Validate tenant ownership
        deletedAt: null,
      },
      include: {
        folder: true,
      },
    });

    if (!document) {
      logger.warn('Document not found or not accessible', { 
        documentId, 
        userTenantId, 
        userId 
      });
      return null;
    }

    // Check if user has required roles to access this document
    // This assumes the document has allowedRoles field, but if not, we can check based on folder permissions
    const hasAccess = this.checkUserAccess(document, userRoles);
    
    if (!hasAccess) {
      logger.warn('User does not have required permissions to access document', { 
        documentId, 
        userId, 
        userRoles,
        requiredRoles: document.allowedRoles || document.folder?.allowedRoles 
      });
      return null;
    }

    return document;
  }

  /**
   * Check if user has required access based on roles
   * @param {Object} document - The document object
   * @param {Array<string>} userRoles - The user's roles
   * @returns {boolean} Whether the user has access
   */
  checkUserAccess(document, userRoles) {
    // If document has specific allowed roles, check against those
    if (document.allowedRoles && document.allowedRoles.length > 0) {
      return userRoles.some(userRole => 
        document.allowedRoles.includes(userRole)
      );
    }

    // If document is in a folder, check folder permissions
    if (document.folder && document.folder.allowedRoles && document.folder.allowedRoles.length > 0) {
      return userRoles.some(userRole => 
        document.folder.allowedRoles.includes(userRole)
      );
    }

    // Default: user can access documents in their own tenant
    // In a more complex system, you might have default access rules
    return true;
  }

  /**
   * Validate S3 object key format and tenant ownership
   * @param {string} s3Key - The S3 object key
   * @param {string} userTenantId - The user's tenant ID
   * @returns {boolean} Whether the key is valid for the tenant
   */
  validateS3Key(s3Key, userTenantId) {
    if (!s3Key || !userTenantId) {
      return false;
    }

    // Ensure the S3 key follows the expected format: tenants/{tenantId}/...
    const expectedPrefix = `tenants/${userTenantId}/`;
    if (!s3Key.startsWith(expectedPrefix)) {
      logger.error('S3 key does not match user tenant', { 
        s3Key, 
        userTenantId 
      });
      return false;
    }

    // Additional validation: ensure key follows expected structure
    const parts = s3Key.split('/');
    if (parts.length < 4 || parts[2] !== 'documents') {
      logger.error('Invalid S3 key structure', { 
        s3Key, 
        userTenantId 
      });
      return false;
    }

    return true;
  }

  /**
   * Generate a presigned download URL for a document with all security validations
   * @param {string} documentId - The document ID
   * @param {string} userId - The user ID from JWT
   * @param {string} userTenantId - The user's tenant ID from JWT
   * @param {Array<string>} userRoles - The user's roles from JWT
   * @returns {Promise<Object>} Object containing the presigned URL and document info
   */
  async generatePresignedDownloadUrl(documentId, userId, userTenantId, userRoles) {
    // Validation 1: Check document access permissions
    const document = await this.validateDocumentAccess(documentId, userId, userTenantId, userRoles);
    if (!document) {
      throw new Error('Document not found or access denied');
    }

    // Validation 2: Validate S3 key format and tenant ownership
    if (!this.validateS3Key(document.storageKey, userTenantId)) {
      logger.error('Invalid S3 key for tenant', { 
        documentId, 
        storageKey: document.storageKey, 
        userTenantId 
      });
      throw new Error('Invalid S3 key for tenant');
    }

    // Validation 3: Ensure the S3 key exists in the database matches the document
    if (!document.storageKey) {
      logger.error('Document does not have an S3 storage key', { documentId });
      throw new Error('Document does not have an S3 storage key');
    }

    // Generate presigned URL using S3 client
    const command = new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: document.storageKey,
    });

    // Generate presigned URL with 1-hour expiry
    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 // 1 hour
    });

    logger.info('Generated presigned download URL', { 
      documentId, 
      userId, 
      userTenantId,
      storageKey: document.storageKey
    });

    return {
      downloadUrl: presignedUrl,
      documentId: document.id,
      fileName: document.originalName || document.name,
      mimeType: document.mimeType,
    };
  }

  /**
   * Validate document exists and is accessible without generating URL
   * @param {string} documentId - The document ID
   * @param {string} userId - The user ID from JWT
   * @param {string} userTenantId - The user's tenant ID from JWT
   * @param {Array<string>} userRoles - The user's roles from JWT
   * @returns {Promise<boolean>} Whether the document is accessible
   */
  async validateDocumentExists(documentId, userId, userTenantId, userRoles) {
    try {
      const document = await this.validateDocumentAccess(documentId, userId, userTenantId, userRoles);
      return !!document;
    } catch (error) {
      logger.error('Error validating document access', { 
        documentId, 
        userId, 
        userTenantId, 
        error: error.message 
      });
      return false;
    }
  }
}

export default new DocumentDownloadService();