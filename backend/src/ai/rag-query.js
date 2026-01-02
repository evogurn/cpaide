import { logger } from '../config/logger.js';
import embedder from './embedder.js';
import vectorStore from './vector-store.js';

/**
 * RAG query service - semantic search over documents
 */
class RagQuery {
  /**
   * Perform RAG search
   */
  async query({ query, tenantId, folderId, limit = 5, minScore = 0.7 }) {
    logger.info('RAG query:', { query, tenantId, folderId, limit });
    
    // 1. Generate embedding for query
    const queryEmbedding = await embedder.generateEmbedding(query);
    
    // 2. Search for similar vectors
    const filters = { tenantId };
    if (folderId) filters.folderId = folderId;
    
    const results = await vectorStore.searchSimilar(queryEmbedding, limit * 2, filters);
    
    // 3. Filter by minimum score
    const filtered = results.filter(r => r.similarity >= minScore);
    
    // 4. Deduplicate by document and take top results
    const deduped = this.deduplicateResults(filtered, limit);
    
    // 5. Format response
    return {
      query,
      results: deduped.map(r => ({
        documentId: r.document.id,
        documentName: r.document.name,
        chunkText: r.chunkText,
        similarity: r.similarity,
        metadata: r.metadata,
      })),
      total: deduped.length,
    };
  }

  /**
   * Deduplicate results by document
   */
  deduplicateResults(results, limit) {
    const seen = new Set();
    const deduped = [];
    
    for (const result of results) {
      if (!seen.has(result.documentId)) {
        seen.add(result.documentId);
        deduped.push(result);
        
        if (deduped.length >= limit) break;
      }
    }
    
    return deduped;
  }

  /**
   * Hybrid search (keyword + semantic)
   */
  async hybridSearch({ query, tenantId, folderId, limit = 5 }) {
    logger.info('Hybrid search:', { query, tenantId, folderId });
    
    // Perform both semantic and keyword search
    const [semanticResults, keywordResults] = await Promise.all([
      this.query({ query, tenantId, folderId, limit }),
      this.keywordSearch({ query, tenantId, folderId, limit }),
    ]);
    
    // Merge and rank results
    const merged = this.mergeResults(semanticResults.results, keywordResults);
    
    return {
      query,
      results: merged.slice(0, limit),
      total: merged.length,
    };
  }

  /**
   * Keyword search fallback
   */
  async keywordSearch({ query, tenantId, folderId, limit }) {
    // TODO: Implement full-text search using PostgreSQL
    return [];
  }

  /**
   * Merge search results with ranking
   */
  mergeResults(semantic, keyword) {
    const combined = [...semantic, ...keyword];
    const scoreMap = new Map();
    
    for (const result of combined) {
      const existing = scoreMap.get(result.documentId);
      if (existing) {
        existing.score += result.similarity || 0.5;
      } else {
        scoreMap.set(result.documentId, {
          ...result,
          score: result.similarity || 0.5,
        });
      }
    }
    
    return Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score);
  }
}

export default new RagQuery();
