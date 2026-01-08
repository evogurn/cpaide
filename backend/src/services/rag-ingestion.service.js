import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import s3Guard from '../utils/s3-guard.js';
import textExtractor from '../ai/text-extractor.js';
import embedder from '../ai/embedder.js';
import vectorStore from '../ai/vector-store.js';
import prisma from '../config/db.js';

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

class RAGIngestionService {
  /**
   * Process a single document for RAG ingestion with tenant isolation
   * @param {string} s3Key - The S3 key of the document to process
   * @param {string} tenantId - The tenant ID
   * @param {string} documentId - The document ID in the database
   * @returns {Promise<boolean>} Whether the processing was successful
   */
  async processDocument(s3Key, tenantId, documentId) {
    try {
      // Tenant safety: Validate that the S3 key belongs to the tenant
      if (!s3Guard.validateS3Key(s3Key, tenantId)) {
        logger.error('S3 key does not belong to tenant', { s3Key, tenantId });
        return false;
      }

      // Fetch document from S3
      const documentBuffer = await this.fetchDocumentFromS3(s3Key);
      
      // Extract text from the document
      const extractedText = await textExtractor.extract(documentBuffer);
      
      // Update document status and extracted text in database
      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractedText,
          status: 'EXTRACTED',
        },
      });

      // Chunk the extracted text
      const chunks = await this.chunkText(extractedText, documentId);
      
      // Generate embeddings for chunks
      const embeddings = await embedder.generateEmbeddings(
        chunks.map(chunk => chunk.text)
      );

      // Store embeddings in vector database with tenant metadata
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];
        
        await vectorStore.storeEmbedding({
          id: `${documentId}_chunk_${i}`,
          vector: embedding,
          metadata: {
            tenantId,
            documentId,
            chunkIndex: i,
            text: chunk.text,
            source: s3Key,
          },
        });
      }

      // Update document status to ready
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'READY',
        },
      });

      logger.info('Document processed successfully for RAG', { 
        documentId, 
        tenantId, 
        chunkCount: chunks.length 
      });

      return true;
    } catch (error) {
      logger.error('Error processing document for RAG', { 
        error: error.message, 
        documentId, 
        tenantId, 
        s3Key 
      });

      // Update document status to error
      try {
        await prisma.document.update({
          where: { id: documentId },
          data: {
            status: 'ERROR',
            metadata: {
              ...document.metadata,
              error: error.message,
            },
          },
        });
      } catch (updateError) {
        logger.error('Error updating document status', { 
          error: updateError.message, 
          documentId 
        });
      }

      return false;
    }
  }

  /**
   * Fetch document content from S3 with tenant validation
   * @param {string} s3Key - The S3 key of the document
   * @returns {Promise<Buffer>} The document content as a buffer
   */
  async fetchDocumentFromS3(s3Key) {
    try {
      const command = new GetObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: s3Key,
      });

      const response = await s3Client.send(command);
      const buffer = await response.Body.transformToByteArray();
      
      return Buffer.from(buffer);
    } catch (error) {
      logger.error('Error fetching document from S3', { 
        error: error.message, 
        s3Key 
      });
      throw error;
    }
  }

  /**
   * Chunk the extracted text
   * @param {string} text - The extracted text
   * @param {string} documentId - The document ID
   * @returns {Promise<Array>} Array of text chunks with metadata
   */
  async chunkText(text, documentId) {
    // Simple chunking logic - in a real implementation, you might want more sophisticated chunking
    const chunkSize = 1000; // characters per chunk
    const chunks = [];
    
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunkText = text.substring(i, i + chunkSize);
      chunks.push({
        id: `${documentId}_chunk_${chunks.length}`,
        text: chunkText,
        documentId,
        chunkIndex: chunks.length,
      });
    }
    
    return chunks;
  }

  /**
   * Process all documents for a specific tenant (tenant-safe bulk operation)
   * @param {string} tenantId - The tenant ID
   * @returns {Promise<number>} Number of documents processed
   */
  async processAllTenantDocuments(tenantId) {
    try {
      // Tenant safety: Build the prefix for this specific tenant only
      const tenantPrefix = `tenants/${tenantId}/documents/raw/`;
      
      // Fetch documents from database that need processing for this tenant
      const documents = await prisma.document.findMany({
        where: {
          tenantId,
          status: { in: ['PENDING', 'EXTRACTED'] }, // Only process documents that need it
          deletedAt: null,
        },
        take: 100, // Limit batch size
      });

      let processedCount = 0;

      for (const document of documents) {
        // Ensure the document's S3 key belongs to the tenant
        if (document.storageKey && s3Guard.validateS3Key(document.storageKey, tenantId)) {
          const success = await this.processDocument(
            document.storageKey, 
            tenantId, 
            document.id
          );
          
          if (success) {
            processedCount++;
          }
        } else {
          logger.warn('Document S3 key does not match tenant', { 
            documentId: document.id, 
            tenantId, 
            storageKey: document.storageKey 
          });
        }
      }

      logger.info('Tenant documents processing completed', { 
        tenantId, 
        processedCount, 
        totalDocuments: documents.length 
      });

      return processedCount;
    } catch (error) {
      logger.error('Error processing tenant documents', { 
        error: error.message, 
        tenantId 
      });
      throw error;
    }
  }

  /**
   * Process documents from a specific folder within a tenant
   * @param {string} tenantId - The tenant ID
   * @param {string} folderId - The folder ID
   * @returns {Promise<number>} Number of documents processed
   */
  async processFolderDocuments(tenantId, folderId) {
    try {
      // Fetch documents from database that need processing for this tenant and folder
      const documents = await prisma.document.findMany({
        where: {
          tenantId,
          folderId,
          status: { in: ['PENDING', 'EXTRACTED'] },
          deletedAt: null,
        },
        take: 50, // Limit batch size for folders
      });

      let processedCount = 0;

      for (const document of documents) {
        // Validate tenant ownership of the S3 key
        if (document.storageKey && s3Guard.validateS3Key(document.storageKey, tenantId)) {
          const success = await this.processDocument(
            document.storageKey, 
            tenantId, 
            document.id
          );
          
          if (success) {
            processedCount++;
          }
        }
      }

      logger.info('Folder documents processing completed', { 
        tenantId, 
        folderId, 
        processedCount 
      });

      return processedCount;
    } catch (error) {
      logger.error('Error processing folder documents', { 
        error: error.message, 
        tenantId, 
        folderId 
      });
      throw error;
    }
  }

  /**
   * Get tenant-specific document list from S3 (tenant-safe listing)
   * @param {string} tenantId - The tenant ID
   * @param {string} subfolder - The subfolder (raw, extracted, etc.)
   * @returns {Promise<Array>} List of document keys
   */
  async listTenantDocuments(tenantId, subfolder = 'raw') {
    try {
      // Tenant safety: Build the prefix for this specific tenant only
      const prefix = `tenants/${tenantId}/documents/${subfolder}/`;
      
      const command = new ListObjectsV2Command({
        Bucket: env.AWS_BUCKET_NAME,
        Prefix: prefix,
      });

      const response = await s3Client.send(command);
      
      // Tenant safety: Validate each key belongs to the tenant
      const validKeys = s3Guard.filterTenantS3Keys(
        response.Contents?.map(obj => obj.Key) || [], 
        tenantId
      );

      logger.info('Tenant documents listed', { 
        tenantId, 
        subfolder, 
        count: validKeys.length 
      });

      return validKeys;
    } catch (error) {
      logger.error('Error listing tenant documents from S3', { 
        error: error.message, 
        tenantId, 
        subfolder 
      });
      throw error;
    }
  }
}

export default new RAGIngestionService();