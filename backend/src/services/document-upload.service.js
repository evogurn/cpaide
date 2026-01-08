import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { generateUniqueFilename } from '../utils/file.js';

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

class DocumentUploadService {
  /**
   * Generate a secure S3 object key with tenant isolation
   * @param {string} tenantId - The tenant ID from authenticated user
   * @param {string} originalFilename - The original filename from user
   * @param {string} documentId - The document ID (optional, can be generated)
   * @returns {string} The secure S3 object key
   */
  generateSecureObjectKey(tenantId, originalFilename, documentId = null) {
    // Validate tenantId format to prevent path traversal
    if (!tenantId || !/^[a-zA-Z0-9_-]+$/.test(tenantId)) {
      logger.error('Invalid tenantId format', { tenantId });
      throw new Error('Invalid tenant ID format');
    }

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = this.sanitizeFilename(originalFilename);
    if (!sanitizedFilename) {
      logger.error('Invalid filename', { originalFilename });
      throw new Error('Invalid filename');
    }

    // Generate unique filename to prevent conflicts
    const uniqueFilename = generateUniqueFilename(sanitizedFilename);

    // Construct secure object key with tenant prefix - this is the critical security measure
    const objectKey = `tenants/${tenantId}/documents/raw/${documentId || 'temp'}/${uniqueFilename}`;

    logger.info('Generated secure object key', { 
      tenantId, 
      originalFilename, 
      objectKey 
    });

    return objectKey;
  }

  /**
   * Sanitize filename to prevent path traversal and other security issues
   * @param {string} filename - The original filename
   * @returns {string} Sanitized filename
   */
  sanitizeFilename(filename) {
    if (!filename) return null;

    // Remove any path traversal attempts
    filename = filename.replace(/\.\.\//g, '');
    filename = filename.replace(/\.\.\\/g, '');
    filename = filename.replace(/\/\.\./g, '');
    filename = filename.replace(/\\\.\./g, '');

    // Remove any null bytes
    filename = filename.replace(/\0/g, '');

    // Get the file extension and base name separately
    const lastDotIndex = filename.lastIndexOf('.');
    let baseName, extension = '';

    if (lastDotIndex > 0) {
      baseName = filename.substring(0, lastDotIndex);
      extension = filename.substring(lastDotIndex);
    } else {
      baseName = filename;
    }

    // Sanitize base name (allow letters, numbers, spaces, hyphens, underscores)
    baseName = baseName.replace(/[^a-zA-Z0-9 _-]/g, '_');

    // Sanitize extension (allow only letters, numbers, dots)
    extension = extension.replace(/[^a-zA-Z0-9.]/g, '');

    return baseName + extension;
  }

  /**
   * Validate file type against allowed types
   * @param {string} mimeType - The MIME type of the file
   * @param {string} filename - The filename
   * @returns {boolean} Whether the file type is allowed
   */
  validateFileType(mimeType, filename) {
    const allowedTypes = env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim());
    const fileExtension = filename.split('.').pop().toLowerCase();

    // Check against common MIME types for allowed extensions
    const mimeToExtension = {
      'application/pdf': ['pdf'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
      'text/plain': ['txt'],
      'text/markdown': ['md'],
      'application/vnd.ms-excel': ['xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
      'text/csv': ['csv'],
      'image/png': ['png'],
      'image/jpeg': ['jpg', 'jpeg'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
    };

    // Check if the file extension is allowed
    if (allowedTypes.includes(fileExtension)) {
      return true;
    }

    // Check if the MIME type is allowed based on extension mapping
    for (const [mime, extensions] of Object.entries(mimeToExtension)) {
      if (mime === mimeType && extensions.includes(fileExtension) && allowedTypes.some(allowed => extensions.includes(allowed))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate file size against maximum allowed size
   * @param {number} fileSize - The file size in bytes
   * @returns {boolean} Whether the file size is within limits
   */
  validateFileSize(fileSize) {
    const maxSize = env.MAX_FILE_SIZE;
    return fileSize <= maxSize;
  }

  /**
   * Generate a presigned URL for secure file upload
   * @param {string} tenantId - The tenant ID from authenticated user
   * @param {string} originalFilename - The original filename from user
   * @param {string} mimeType - The MIME type of the file
   * @param {number} fileSize - The file size in bytes
   * @param {string} documentId - The document ID (optional)
   * @returns {Promise<Object>} Object containing the presigned URL and object key
   */
  async generatePresignedUploadUrl(tenantId, originalFilename, mimeType, fileSize, documentId = null) {
    // Security check 1: Validate tenant ID
    if (!tenantId) {
      logger.error('Missing tenant ID for upload request');
      throw new Error('Unauthorized: Missing tenant ID');
    }

    // Security check 2: Validate file type
    if (!this.validateFileType(mimeType, originalFilename)) {
      logger.error('File type not allowed', { mimeType, originalFilename });
      throw new Error('File type not allowed');
    }

    // Security check 3: Validate file size
    if (!this.validateFileSize(fileSize)) {
      logger.error('File size exceeds limit', { 
        fileSize, 
        maxSize: env.MAX_FILE_SIZE,
        originalFilename 
      });
      throw new Error('File size exceeds maximum allowed size');
    }

    // Security check 4: Generate secure object key with tenant prefix
    const objectKey = this.generateSecureObjectKey(tenantId, originalFilename, documentId);

    // Security check 5: Create S3 command with tenant-enforced key
    const command = new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: objectKey,
      ContentType: mimeType,
    });

    // Generate presigned URL with 1-hour expiry
    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 // 1 hour
    });

    logger.info('Generated presigned upload URL', { 
      tenantId, 
      originalFilename, 
      objectKey,
      mimeType
    });

    return {
      presignedUrl,
      objectKey,
      filename: originalFilename,
    };
  }

  /**
   * Validate that an object key belongs to the correct tenant
   * @param {string} objectKey - The S3 object key
   * @param {string} tenantId - The expected tenant ID
   * @returns {boolean} Whether the object key is valid for the tenant
   */
  validateTenantObjectKey(objectKey, tenantId) {
    const expectedPrefix = `tenants/${tenantId}/`;
    return objectKey.startsWith(expectedPrefix);
  }

  /**
   * Get tenant ID from object key
   * @param {string} objectKey - The S3 object key
   * @returns {string|null} The tenant ID or null if not found
   */
  getTenantIdFromObjectKey(objectKey) {
    const match = objectKey.match(/^tenants\/([^\/]+)\//);
    return match ? match[1] : null;
  }
}

export default new DocumentUploadService();