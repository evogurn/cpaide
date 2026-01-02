import aiService from '../services/ai.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/response.js';

class AIController {
  /**
   * Perform RAG query
   */
  async ragQuery(req, res, next) {
    try {
      const { query, folderId, limit = 5, minScore = 0.7 } = req.body;
      
      const results = await aiService.ragQuery({
        query,
        tenantId: req.tenantId,
        userId: req.userId,
        folderId,
        limit,
        minScore,
      });
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(results, 'RAG query completed')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reprocess document embeddings
   */
  async reprocessDocument(req, res, next) {
    try {
      const { documentId } = req.params;
      
      const result = await aiService.reprocessDocument(documentId);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Document queued for reprocessing')
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new AIController();
