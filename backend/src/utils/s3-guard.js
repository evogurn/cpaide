import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * S3 Tenant Isolation Guard Utilities
 * Provides reusable functions to enforce tenant isolation for S3 operations
 */

class S3Guard {
  /**
   * Validate that an S3 key belongs to the specified tenant
   * @param {string} s3Key - The S3 object key to validate
   * @param {string} tenantId - The expected tenant ID
   * @returns {boolean} Whether the S3 key is valid for the tenant
   */
  validateTenantOwnership(s3Key, tenantId) {
    if (!s3Key || !tenantId) {
      logger.error('S3 key or tenant ID missing for validation', { s3Key, tenantId });
      return false;
    }

    // Sanitize inputs to prevent injection
    const sanitizedKey = this.sanitizeS3Key(s3Key);
    const sanitizedTenantId = this.sanitizeTenantId(tenantId);

    if (!sanitizedKey || !sanitizedTenantId) {
      logger.error('Invalid S3 key or tenant ID format', { s3Key, tenantId });
      return false;
    }

    // Check that the S3 key starts with the correct tenant prefix
    const expectedPrefix = `tenants/${sanitizedTenantId}/`;
    if (!sanitizedKey.startsWith(expectedPrefix)) {
      logger.warn('S3 key does not belong to tenant', { 
        s3Key: sanitizedKey, 
        tenantId: sanitizedTenantId,
        expectedPrefix 
      });
      return false;
    }

    return true;
  }

  /**
   * Sanitize S3 key to prevent directory traversal and other attacks
   * @param {string} s3Key - The S3 key to sanitize
   * @returns {string|null} Sanitized S3 key or null if invalid
   */
  sanitizeS3Key(s3Key) {
    if (!s3Key || typeof s3Key !== 'string') {
      return null;
    }

    // Remove null bytes and control characters
    let sanitized = s3Key.replace(/[\0-\x1F\x7F]/g, '');

    // Prevent directory traversal
    sanitized = sanitized.replace(/\.\.\//g, '');
    sanitized = sanitized.replace(/\.\.\\/g, '');
    sanitized = sanitized.replace(/\/\.\./g, '');
    sanitized = sanitized.replace(/\\\.\./g, '');

    // Additional sanitization could be added here if needed
    return sanitized;
  }

  /**
   * Sanitize tenant ID to prevent injection attacks
   * @param {string} tenantId - The tenant ID to sanitize
   * @returns {string|null} Sanitized tenant ID or null if invalid
   */
  sanitizeTenantId(tenantId) {
    if (!tenantId || typeof tenantId !== 'string') {
      return null;
    }

    // Only allow alphanumeric characters, hyphens, and underscores
    const sanitized = tenantId.replace(/[^a-zA-Z0-9_-]/g, '');
    
    // Ensure it's not empty after sanitization
    return sanitized.length > 0 ? sanitized : null;
  }

  /**
   * Validate S3 key structure and format
   * @param {string} s3Key - The S3 key to validate
   * @returns {boolean} Whether the S3 key has a valid structure
   */
  validateS3KeyStructure(s3Key) {
    if (!s3Key) {
      return false;
    }

    const parts = s3Key.split('/');
    
    // Should have at least 4 parts: tenants/{tenantId}/documents/{subfolder}/filename
    if (parts.length < 4) {
      logger.warn('S3 key has insufficient parts', { s3Key, partsCount: parts.length });
      return false;
    }

    // First part should be 'tenants'
    if (parts[0] !== 'tenants') {
      logger.warn('S3 key does not start with tenants/', { s3Key });
      return false;
    }

    // Third part should be 'documents'
    if (parts[2] !== 'documents') {
      logger.warn('S3 key does not follow documents structure', { s3Key });
      return false;
    }

    return true;
  }

  /**
   * Validate that an S3 key belongs to the tenant and has proper structure
   * @param {string} s3Key - The S3 key to validate
   * @param {string} tenantId - The expected tenant ID
   * @returns {boolean} Whether the S3 key is valid
   */
  validateS3Key(s3Key, tenantId) {
    return (
      this.validateTenantOwnership(s3Key, tenantId) &&
      this.validateS3KeyStructure(s3Key)
    );
  }

  /**
   * Extract tenant ID from S3 key
   * @param {string} s3Key - The S3 key to extract tenant ID from
   * @returns {string|null} The extracted tenant ID or null if not found
   */
  extractTenantId(s3Key) {
    if (!s3Key) {
      return null;
    }

    const match = s3Key.match(/^tenants\/([^\/]+)\//);
    return match ? match[1] : null;
  }

  /**
   * Generate a secure S3 key for a tenant
   * @param {string} tenantId - The tenant ID
   * @param {string} documentId - The document ID
   * @param {string} filename - The filename
   * @param {string} subfolder - The subfolder (raw, extracted, chunks, embeddings)
   * @returns {string} The secure S3 key
   */
  generateSecureS3Key(tenantId, documentId, filename, subfolder = 'raw') {
    const sanitizedTenantId = this.sanitizeTenantId(tenantId);
    const sanitizedDocumentId = this.sanitizeTenantId(documentId); // Document IDs should also be safe
    const sanitizedFilename = this.sanitizeS3Key(filename);

    if (!sanitizedTenantId || !sanitizedDocumentId || !sanitizedFilename) {
      throw new Error('Invalid parameters for S3 key generation');
    }

    return `tenants/${sanitizedTenantId}/documents/${subfolder}/${sanitizedDocumentId}/${sanitizedFilename}`;
  }

  /**
   * Guard function that throws an error if S3 key is not valid for tenant
   * @param {string} s3Key - The S3 key to validate
   * @param {string} tenantId - The expected tenant ID
   * @param {string} operation - The operation name for logging (e.g., 'upload', 'download')
   */
  guardS3Access(s3Key, tenantId, operation = 'access') {
    if (!this.validateS3Key(s3Key, tenantId)) {
      logger.error(`Unauthorized S3 ${operation} attempt`, { 
        s3Key, 
        tenantId,
        operation 
      });
      
      const error = new Error(`Unauthorized S3 access for tenant ${tenantId}`);
      error.statusCode = 403;
      throw error;
    }
  }

  /**
   * Validate multiple S3 keys for the same tenant
   * @param {Array<string>} s3Keys - Array of S3 keys to validate
   * @param {string} tenantId - The expected tenant ID
   * @returns {Array<boolean>} Array of validation results
   */
  validateMultipleS3Keys(s3Keys, tenantId) {
    return s3Keys.map(key => this.validateS3Key(key, tenantId));
  }

  /**
   * Filter S3 keys to only include those belonging to the tenant
   * @param {Array<string>} s3Keys - Array of S3 keys to filter
   * @param {string} tenantId - The expected tenant ID
   * @returns {Array<string>} Array of valid S3 keys for the tenant
   */
  filterTenantS3Keys(s3Keys, tenantId) {
    return s3Keys.filter(key => this.validateS3Key(key, tenantId));
  }
}

export default new S3Guard();