import { logger } from '../config/logger.js';

/**
 * Text chunker for RAG pipeline
 */
class Chunker {
  /**
   * Split text into chunks for embedding
   */
  chunkText(text, chunkSize = 500, overlap = 50) {
    logger.info('Chunking text:', { length: text.length, chunkSize, overlap });
    
    const chunks = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let currentSize = 0;
    
    for (const sentence of sentences) {
      const sentenceLength = sentence.trim().length;
      
      if (currentSize + sentenceLength > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Overlap: keep last part
        const words = currentChunk.split(' ');
        currentChunk = words.slice(-overlap).join(' ') + ' ' + sentence;
        currentSize = currentChunk.length;
      } else {
        currentChunk += ' ' + sentence;
        currentSize += sentenceLength;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Chunk text with metadata preservation
   */
  chunkWithMetadata(text, metadata = {}) {
    const chunks = this.chunkText(text);
    
    return chunks.map((chunk, index) => ({
      chunkIndex: index,
      chunkText: chunk,
      metadata: {
        ...metadata,
        totalChunks: chunks.length,
      },
    }));
  }
}

export default new Chunker();
