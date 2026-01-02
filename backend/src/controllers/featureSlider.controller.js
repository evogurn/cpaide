import featureSliderService from '../services/featureSlider.service.js';

class FeatureSliderController {
  /**
   * Get all feature slider slides for the tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSlides(req, res) {
    try {
      const { tenantId } = req.user;
      const slides = await featureSliderService.getSlides(tenantId);
      res.json({
        success: true,
        data: slides,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get enabled feature slider slides for the tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getEnabledSlides(req, res) {
    try {
      // For public endpoint, we need to get tenantId from query params or headers
      // In a real implementation, this would come from the request context
      // For now, we'll need to pass tenantId as a query parameter
      const { tenantId } = req.query;
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
      }
      
      const slides = await featureSliderService.getEnabledSlides(tenantId);
      res.json({
        success: true,
        data: slides,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Create a new feature slider slide
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createSlide(req, res) {
    try {
      const { tenantId } = req.user;
      const slideData = req.body;
      
      const slide = await featureSliderService.createSlide(tenantId, slideData);
      res.status(201).json({
        success: true,
        data: slide,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update a feature slider slide
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSlide(req, res) {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;
      const slideData = req.body;
      
      const slide = await featureSliderService.updateSlide(tenantId, id, slideData);
      res.json({
        success: true,
        data: slide,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete a feature slider slide
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteSlide(req, res) {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;
      
      await featureSliderService.deleteSlide(tenantId, id);
      res.json({
        success: true,
        message: 'Slide deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Reorder feature slider slides
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async reorderSlides(req, res) {
    try {
      const { tenantId } = req.user;
      const { slideIds } = req.body;
      
      const slides = await featureSliderService.reorderSlides(tenantId, slideIds);
      res.json({
        success: true,
        data: slides,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Initialize default slides for a tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async initializeDefaultSlides(req, res) {
    try {
      const { tenantId } = req.user;
      const slides = await featureSliderService.initializeDefaultSlides(tenantId);
      res.json({
        success: true,
        data: slides,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new FeatureSliderController();