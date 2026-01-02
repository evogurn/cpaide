import tenantService from '../services/tenant.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/response.js';

class ProjectLabelController {
  /**
   * Get project label for the current tenant
   */
  async getProjectLabel(req, res, next) {
    try {
      const { tenantId } = req.user;
      
      // Get project label from tenant service
      const projectLabel = await tenantService.getProjectLabel(tenantId);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({ label: projectLabel }, 'Project label retrieved')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update project label for the current tenant
   */
  async updateProjectLabel(req, res, next) {
    try {
      const { tenantId } = req.user;
      const { label } = req.body;
      
      // Log the received payload for debugging
      console.log('Received project label update request:', { tenantId, label });
      
      // Update project label through tenant service
      const updatedLabel = await tenantService.updateProjectLabel(tenantId, label);
      
      console.log('Updated project label:', updatedLabel);
      
      return res.status(HTTP_STATUS.OK).json(
        successResponse({ label: updatedLabel }, 'Project label updated')
      );
    } catch (error) {
      console.error('Error updating project label:', error);
      next(error);
    }
  }
}

export default new ProjectLabelController();