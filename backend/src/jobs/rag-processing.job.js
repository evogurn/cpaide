import { logger } from '../config/logger.js';
import ragIngestionService from '../services/rag-ingestion.service.js';
import prisma from '../config/db.js';

class RAGProcessingJob {
  /**
   * Process pending documents for RAG ingestion
   * This method can be called by a scheduler or triggered by document upload
   */
  async processPendingDocuments() {
    try {
      logger.info('Starting RAG processing job for pending documents');

      // Get all tenants that have pending documents
      const tenantsWithPendingDocs = await prisma.document.groupBy({
        by: ['tenantId'],
        where: {
          status: { in: ['PENDING', 'EXTRACTED'] },
          deletedAt: null,
        },
      });

      let totalProcessed = 0;

      // Process documents for each tenant separately (tenant isolation)
      for (const tenantGroup of tenantsWithPendingDocs) {
        const { tenantId } = tenantGroup;
        
        logger.info('Processing documents for tenant', { tenantId });
        
        try {
          const processedCount = await ragIngestionService.processAllTenantDocuments(tenantId);
          totalProcessed += processedCount;
          
          logger.info('Tenant processing completed', { 
            tenantId, 
            processedCount 
          });
        } catch (tenantError) {
          logger.error('Error processing tenant documents', { 
            error: tenantError.message, 
            tenantId 
          });
          // Continue with other tenants even if one fails
        }
      }

      logger.info('RAG processing job completed', { totalProcessed });
      return totalProcessed;
    } catch (error) {
      logger.error('Error in RAG processing job', { error: error.message });
      throw error;
    }
  }

  /**
   * Process documents for a specific tenant
   * @param {string} tenantId - The tenant ID
   */
  async processTenantDocuments(tenantId) {
    try {
      logger.info('Starting RAG processing job for specific tenant', { tenantId });
      
      const processedCount = await ragIngestionService.processAllTenantDocuments(tenantId);
      
      logger.info('Tenant RAG processing completed', { 
        tenantId, 
        processedCount 
      });
      
      return processedCount;
    } catch (error) {
      logger.error('Error in tenant-specific RAG processing job', { 
        error: error.message, 
        tenantId 
      });
      throw error;
    }
  }

  /**
   * Process a specific document
   * @param {string} documentId - The document ID
   * @param {string} tenantId - The tenant ID
   */
  async processDocument(documentId, tenantId) {
    try {
      logger.info('Starting RAG processing for specific document', { 
        documentId, 
        tenantId 
      });

      // Get document details from database
      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          tenantId,
          deletedAt: null,
        },
      });

      if (!document) {
        logger.error('Document not found or not accessible', { 
          documentId, 
          tenantId 
        });
        return false;
      }

      if (!document.storageKey) {
        logger.error('Document has no storage key', { documentId });
        return false;
      }

      // Tenant safety: Validate that the document belongs to the tenant
      if (document.tenantId !== tenantId) {
        logger.error('Document does not belong to specified tenant', { 
          documentId, 
          documentTenantId: document.tenantId,
          providedTenantId: tenantId
        });
        return false;
      }

      const success = await ragIngestionService.processDocument(
        document.storageKey,
        tenantId,
        documentId
      );

      logger.info('Document RAG processing completed', { 
        documentId, 
        tenantId, 
        success 
      });

      return success;
    } catch (error) {
      logger.error('Error in document-specific RAG processing', { 
        error: error.message, 
        documentId, 
        tenantId 
      });
      throw error;
    }
  }

  /**
   * Schedule regular processing of pending documents
   */
  scheduleRegularProcessing() {
    // Process pending documents every 5 minutes
    const interval = setInterval(async () => {
      try {
        await this.processPendingDocuments();
      } catch (error) {
        logger.error('Error in scheduled RAG processing', { error: error.message });
      }
    }, 5 * 60 * 1000); // 5 minutes

    logger.info('RAG processing job scheduled');
    
    // Return the interval ID so it can be cleared if needed
    return interval;
  }
}

export default new RAGProcessingJob();