import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import prisma from '../config/db.js';
import s3Guard from '../utils/s3-guard.js';

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

class TenantDeletionService {
  /**
   * Safely delete all S3 objects for a tenant
   * @param {string} tenantId - The tenant ID to delete
   * @param {boolean} force - Whether to force deletion without confirmation
   * @returns {Promise<Object>} Deletion results
   */
  async deleteTenantS3Data(tenantId, force = false) {
    try {
      // Safety check 1: Validate tenant ID format
      if (!s3Guard.sanitizeTenantId(tenantId)) {
        logger.error('Invalid tenant ID format for deletion', { tenantId });
        throw new Error('Invalid tenant ID format');
      }

      // Safety check 2: Verify tenant exists in database
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        logger.error('Tenant not found for deletion', { tenantId });
        throw new Error('Tenant not found');
      }

      // Safety check 3: Verify tenant has no active users (optional, depending on business rules)
      const activeUsers = await prisma.user.count({
        where: {
          tenantId,
          status: 'ACTIVE',
        },
      });

      if (activeUsers > 0 && !force) {
        logger.warn('Tenant has active users, skipping deletion', { 
          tenantId, 
          activeUsers 
        });
        throw new Error(`Tenant has ${activeUsers} active users. Use force=true to override.`);
      }

      // Safety check 4: Validate the S3 prefix format
      const prefix = `tenants/${tenantId}/`;
      if (!prefix.startsWith('tenants/') || !prefix.includes('/')) {
        logger.error('Invalid S3 prefix format', { prefix });
        throw new Error('Invalid S3 prefix format');
      }

      // List all objects for the tenant
      logger.info('Starting tenant S3 data deletion', { tenantId, prefix });
      
      const objectsToDelete = await this.listTenantObjects(tenantId);
      logger.info('Found objects to delete', { 
        tenantId, 
        objectCount: objectsToDelete.length 
      });

      if (objectsToDelete.length === 0) {
        logger.info('No S3 objects found for tenant, proceeding with database cleanup', { tenantId });
        return { deletedCount: 0, tenantId };
      }

      // Safety check 5: Verify all objects belong to the tenant
      const validObjects = s3Guard.filterTenantS3Keys(objectsToDelete, tenantId);
      if (validObjects.length !== objectsToDelete.length) {
        logger.error('Found objects that do not belong to tenant', { 
          tenantId, 
          totalObjects: objectsToDelete.length,
          validObjects: validObjects.length,
          invalidObjects: objectsToDelete.length - validObjects.length
        });
        throw new Error('Invalid objects found in tenant prefix');
      }

      // Perform deletion in batches (S3 DeleteObjects supports up to 1000 objects per request)
      let totalDeleted = 0;
      const batchSize = 1000;
      
      for (let i = 0; i < validObjects.length; i += batchSize) {
        const batch = validObjects.slice(i, i + batchSize).map(Key => ({ Key }));
        
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: env.AWS_BUCKET_NAME,
          Delete: {
            Objects: batch,
            Quiet: false, // Return information about deleted objects
          },
        });

        const deleteResult = await s3Client.send(deleteCommand);
        
        if (deleteResult.Errors && deleteResult.Errors.length > 0) {
          logger.error('Errors during S3 deletion', { 
            tenantId, 
            errors: deleteResult.Errors 
          });
          // Continue with other batches but log errors
        }

        totalDeleted += deleteResult.Deleted?.length || 0;
        logger.info('S3 deletion batch completed', { 
          tenantId, 
          batchIndex: i / batchSize + 1,
          deletedInBatch: deleteResult.Deleted?.length || 0,
          totalDeletedSoFar: totalDeleted
        });
      }

      logger.info('Tenant S3 data deletion completed', { 
        tenantId, 
        totalDeleted,
        requestedDeletionCount: validObjects.length
      });

      // Audit log for deletion
      await this.logDeletionAudit(tenantId, totalDeleted, validObjects.length);

      return { 
        deletedCount: totalDeleted, 
        requestedDeletionCount: validObjects.length,
        tenantId 
      };
    } catch (error) {
      logger.error('Error deleting tenant S3 data', { 
        error: error.message, 
        tenantId,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * List all S3 objects for a specific tenant
   * @param {string} tenantId - The tenant ID
   * @returns {Promise<Array>} List of object keys
   */
  async listTenantObjects(tenantId) {
    try {
      const prefix = `tenants/${tenantId}/`;
      const objectKeys = [];

      let continuationToken = undefined;
      
      do {
        const listCommand = new ListObjectsV2Command({
          Bucket: env.AWS_BUCKET_NAME,
          Prefix: prefix,
          ContinuationToken: continuationToken,
          MaxKeys: 1000, // Process in batches
        });

        const response = await s3Client.send(listCommand);
        
        if (response.Contents) {
          objectKeys.push(...response.Contents.map(obj => obj.Key));
        }
        
        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      return objectKeys;
    } catch (error) {
      logger.error('Error listing tenant objects', { 
        error: error.message, 
        tenantId 
      });
      throw error;
    }
  }

  /**
   * Verify that a tenant's S3 data will be completely removed
   * @param {string} tenantId - The tenant ID
   * @returns {Promise<boolean>} Whether all data is confirmed deleted
   */
  async verifyTenantDataDeletion(tenantId) {
    try {
      const remainingObjects = await this.listTenantObjects(tenantId);
      const isClean = remainingObjects.length === 0;
      
      logger.info('Tenant data deletion verification', { 
        tenantId, 
        isClean, 
        remainingCount: remainingObjects.length 
      });

      return isClean;
    } catch (error) {
      logger.error('Error verifying tenant data deletion', { 
        error: error.message, 
        tenantId 
      });
      return false; // Assume not clean if verification fails
    }
  }

  /**
   * Log deletion audit for compliance
   * @param {string} tenantId - The tenant ID
   * @param {number} deletedCount - Number of objects deleted
   * @param {number} requestedCount - Number of objects requested for deletion
   */
  async logDeletionAudit(tenantId, deletedCount, requestedCount) {
    try {
      // Log to application audit trail
      await prisma.auditLog.create({
        data: {
          action: 'TENANT_S3_DATA_DELETED',
          entityType: 'tenant',
          entityId: tenantId,
          actorType: 'SYSTEM',
          actorId: 'SYSTEM',
          metadata: {
            deletedObjectCount: deletedCount,
            requestedDeletionCount: requestedCount,
            deletionTimestamp: new Date().toISOString(),
          },
          tenantId, // This might be null after deletion, but we capture it for audit
        },
      });

      logger.info('Tenant deletion audit logged', { 
        tenantId, 
        deletedCount, 
        requestedCount 
      });
    } catch (error) {
      logger.error('Error logging deletion audit', { 
        error: error.message, 
        tenantId 
      });
      // Don't fail the deletion if audit logging fails
    }
  }

  /**
   * Perform complete tenant deletion (both S3 and database)
   * @param {string} tenantId - The tenant ID
   * @param {boolean} force - Whether to force deletion
   * @returns {Promise<Object>} Deletion results
   */
  async deleteTenantComplete(tenantId, force = false) {
    const result = {
      tenantId,
      s3Deletion: null,
      databaseDeletion: null,
      verification: null,
    };

    try {
      // Step 1: Delete S3 data first
      result.s3Deletion = await this.deleteTenantS3Data(tenantId, force);
      
      // Step 2: Verify S3 deletion
      result.verification = await this.verifyTenantDataDeletion(tenantId);
      
      if (!result.verification) {
        logger.error('S3 data not fully deleted, aborting database deletion', { tenantId });
        throw new Error('S3 data not fully deleted, aborting');
      }

      // Step 3: Delete from database (this would be implemented based on your schema)
      // This is a simplified example - you'd need to handle referential integrity
      result.databaseDeletion = await this.deleteTenantDatabaseRecords(tenantId);

      logger.info('Complete tenant deletion completed', { 
        tenantId, 
        s3Deleted: result.s3Deletion.deletedCount,
        databaseDeleted: result.databaseDeletion.affectedRecords
      });

      return result;
    } catch (error) {
      logger.error('Error in complete tenant deletion', { 
        error: error.message, 
        tenantId 
      });
      throw error;
    }
  }

  /**
   * Delete tenant records from database (simplified example)
   * @param {string} tenantId - The tenant ID
   * @returns {Promise<Object>} Database deletion results
   */
  async deleteTenantDatabaseRecords(tenantId) {
    // This is a simplified example - in a real application you'd need to handle
    // foreign key constraints and delete records in the correct order
    const affectedRecords = await prisma.$transaction(async (tx) => {
      // Delete in reverse dependency order to handle foreign keys
      const documents = await tx.document.deleteMany({
        where: { tenantId },
      });
      
      const folders = await tx.folder.deleteMany({
        where: { tenantId },
      });
      
      const users = await tx.user.deleteMany({
        where: { tenantId },
      });
      
      const tenant = await tx.tenant.delete({
        where: { id: tenantId },
      });

      return {
        documents: documents.count,
        folders: folders.count,
        users: users.count,
        tenant: 1,
      };
    });

    return { affectedRecords };
  }
}

export default new TenantDeletionService();
