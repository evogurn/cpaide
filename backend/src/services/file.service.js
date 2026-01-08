import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * File service - S3 integration with tenant isolation
 */
class FileService {
  /**
   * Validate that the storage key belongs to the tenant
   * This is a critical security check to prevent tenant data access
   */
  validateTenantAccess(storageKey, tenantId) {
    // Ensure the storage key starts with the correct tenant prefix
    const expectedPrefix = `tenants/${tenantId}/`;
    if (!storageKey.startsWith(expectedPrefix)) {
      logger.error('Tenant access violation attempt', { storageKey, tenantId });
      const error = new Error('Unauthorized access to storage key');
      error.statusCode = 403;
      throw error;
    }
    
    // Additional validation: ensure storage key follows expected format
    const parts = storageKey.split('/');
    if (parts.length < 4 || parts[2] !== 'documents') {
      logger.error('Invalid storage key format', { storageKey, tenantId });
      const error = new Error('Invalid storage key format');
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Generate pre-signed URL for upload with tenant isolation
   */
  async getUploadUrl(storageKey, contentType, tenantId) {
    // Validate tenant has access to this storage key
    this.validateTenantAccess(storageKey, tenantId);
    
    logger.info('Generating upload URL for:', { storageKey, tenantId });
    
    const command = new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: storageKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
    
    return {
      uploadUrl,
      key: storageKey,
    };
  }

  /**
   * Generate pre-signed URL for download with tenant isolation
   */
  async getDownloadUrl(storageKey, tenantId) {
    // Validate tenant has access to this storage key
    this.validateTenantAccess(storageKey, tenantId);
    
    logger.info('Generating download URL for:', { storageKey, tenantId });
    
    const command = new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: storageKey,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
    
    return {
      downloadUrl,
    };
  }

  /**
   * Delete file from storage with tenant isolation
   */
  async deleteFile(storageKey, tenantId) {
    // Validate tenant has access to this storage key
    this.validateTenantAccess(storageKey, tenantId);
    
    logger.info('Deleting file:', { storageKey, tenantId });
    
    const command = new DeleteObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: storageKey,
    });

    await s3Client.send(command);
    
    return { success: true };
  }

  /**
   * Copy file within storage with tenant isolation
   */
  async copyFile(sourceKey, destinationKey, tenantId) {
    // Validate both source and destination keys belong to the same tenant
    this.validateTenantAccess(sourceKey, tenantId);
    this.validateTenantAccess(destinationKey, tenantId);
    
    logger.info('Copying file:', { sourceKey, destinationKey, tenantId });
    
    const command = new CopyObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      CopySource: `${env.AWS_BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    });

    await s3Client.send(command);
    
    return { success: true, key: destinationKey };
  }

  /**
   * List files for a specific tenant
   */
  async listTenantFiles(tenantId, prefix = null) {
    // Use tenant-specific prefix
    const tenantPrefix = prefix ? `tenants/${tenantId}/${prefix}` : `tenants/${tenantId}/`;
    
    const command = new ListObjectsV2Command({
      Bucket: env.AWS_BUCKET_NAME,
      Prefix: tenantPrefix,
    });

    const response = await s3Client.send(command);
    
    return response.Contents || [];
  }

  /**
   * Check if file exists with tenant isolation
   */
  async fileExists(storageKey, tenantId) {
    // Validate tenant has access to this storage key
    this.validateTenantAccess(storageKey, tenantId);
    
    try {
      const command = new GetObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: storageKey,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }
}

export default new FileService();
