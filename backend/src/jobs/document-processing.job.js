import { logger } from '../config/logger.js';
import prisma from '../config/db.js';
import aiService from '../services/ai.service.js';

/**
 * Background job to process documents for RAG
 * This can be triggered by a queue system (Bull, BullMQ) or cron
 */
class DocumentProcessingJob {
  /**
   * Process pending documents
   */
  async processPendingDocuments() {
    logger.info('Starting document processing job...');
    
    try {
      // Find pending documents
      const pendingDocuments = await prisma.document.findMany({
        where: {
          status: 'PENDING',
          deletedAt: null,
        },
        take: 10, // Process 10 at a time
      });

      logger.info(`Found ${pendingDocuments.length} pending documents`);

      for (const document of pendingDocuments) {
        try {
          logger.info(`Processing document ${document.id}...`);
          
          // TODO: Fetch file from S3
          // const fileBuffer = await fileService.downloadFile(document.storageKey);
          
          // Mock file buffer for now
          const fileBuffer = Buffer.from('Sample document content');
          
          // Process document
          await aiService.processDocument(
            document.id,
            fileBuffer,
            document.mimeType
          );
          
          logger.info(`✅ Successfully processed document ${document.id}`);
        } catch (error) {
          logger.error(`❌ Failed to process document ${document.id}:`, error);
          
          // Mark as failed
          await prisma.document.update({
            where: { id: document.id },
            data: { status: 'FAILED' },
          });
        }
      }

      logger.info('Document processing job completed');
    } catch (error) {
      logger.error('Document processing job failed:', error);
    }
  }

  /**
   * Cleanup old refresh tokens
   */
  async cleanupExpiredTokens() {
    logger.info('Starting token cleanup job...');
    
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true },
          ],
        },
      });

      logger.info(`Cleaned up ${result.count} expired/revoked tokens`);
    } catch (error) {
      logger.error('Token cleanup failed:', error);
    }
  }

  /**
   * Cleanup old audit logs (older than 90 days)
   */
  async cleanupOldAuditLogs() {
    logger.info('Starting audit log cleanup...');
    
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const result = await prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
        },
      });

      logger.info(`Cleaned up ${result.count} old audit logs`);
    } catch (error) {
      logger.error('Audit log cleanup failed:', error);
    }
  }

  /**
   * Start scheduled jobs
   */
  start() {
    logger.info('Starting background jobs...');

    // Process pending documents every 5 minutes
    setInterval(() => {
      this.processPendingDocuments();
    }, 5 * 60 * 1000);

    // Cleanup expired tokens every hour
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000);

    // Cleanup old audit logs daily
    setInterval(() => {
      this.cleanupOldAuditLogs();
    }, 24 * 60 * 60 * 1000);

    // Run initial cleanup on startup
    this.cleanupExpiredTokens();
  }
}

export default new DocumentProcessingJob();
