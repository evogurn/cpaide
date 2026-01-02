import textExtractor from '../ai/text-extractor.js';
import chunker from '../ai/chunker.js';
import embedder from '../ai/embedder.js';
import vectorStore from '../ai/vector-store.js';
import ragQuery from '../ai/rag-query.js';
import prisma from '../config/db.js';
import { logger } from '../config/logger.js';

class AIService {
  /**
   * Process document for RAG (extract, chunk, embed)
   */
  async processDocument(documentId, fileBuffer, mimeType) {
    logger.info('Processing document for RAG:', { documentId, mimeType });
    
    try {
      // Update status to processing
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'PROCESSING' },
      });
      
      // 1. Extract text
      const { text } = await textExtractor.extractText(fileBuffer, mimeType);
      
      // 2. Chunk text
      const chunks = chunker.chunkWithMetadata(text, {
        documentId,
        mimeType,
      });
      
      // 3. Generate embeddings
      const texts = chunks.map(c => c.chunkText);
      const embeddings = await embedder.generateEmbeddings(texts);
      
      // 4. Combine chunks with embeddings
      const chunksWithEmbeddings = chunks.map((chunk, index) => ({
        ...chunk,
        embedding: embeddings[index],
      }));
      
      // 5. Store in vector database
      await vectorStore.storeEmbeddings(documentId, chunksWithEmbeddings);
      
      // 6. Update document with extracted text
      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractedText: text,
          status: 'READY',
        },
      });
      
      return {
        success: true,
        documentId,
        chunksProcessed: chunks.length,
      };
    } catch (error) {
      logger.error('Error processing document:', error);
      
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      });
      
      throw error;
    }
  }

  /**
   * Perform RAG query with permission filtering
   */
  async ragQuery({ query, tenantId, userId, folderId, limit, minScore }) {
    logger.info('RAG query:', { query, tenantId, userId });
    
    // TODO: Apply permission filtering based on user access
    // For now, filter by tenantId
    
    const results = await ragQuery.query({
      query,
      tenantId,
      folderId,
      limit,
      minScore,
    });
    
    return results;
  }

  /**
   * Reprocess document (e.g., after update)
   */
  async reprocessDocument(documentId) {
    logger.info('Reprocessing document:', { documentId });
    
    // Delete old embeddings
    await vectorStore.deleteEmbeddings(documentId);
    
    // TODO: Fetch file from S3 and reprocess
    // This would typically be triggered by a background job
    
    return { success: true, message: 'Document queued for reprocessing' };
  }
}

export default new AIService();
