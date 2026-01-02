import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class FeatureSliderService {
  /**
   * Get all feature slider slides for a tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Array>} Array of feature slider slides
   */
  async getSlides(tenantId) {
    try {
      const slides = await prisma.featureSliderSlide.findMany({
        where: {
          tenantId: tenantId,
        },
        orderBy: {
          order: 'asc',
        },
      });
      
      return slides;
    } catch (error) {
      throw new Error(`Failed to fetch feature slider slides: ${error.message}`);
    }
  }

  /**
   * Get enabled feature slider slides for a tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Array>} Array of enabled feature slider slides
   */
  async getEnabledSlides(tenantId) {
    try {
      const slides = await prisma.featureSliderSlide.findMany({
        where: {
          tenantId: tenantId,
          enabled: true,
        },
        orderBy: {
          order: 'asc',
        },
      });
      
      return slides;
    } catch (error) {
      throw new Error(`Failed to fetch enabled feature slider slides: ${error.message}`);
    }
  }

  /**
   * Create a new feature slider slide
   * @param {string} tenantId - Tenant ID
   * @param {Object} slideData - Slide data
   * @returns {Promise<Object>} Created slide
   */
  async createSlide(tenantId, slideData) {
    try {
      // Get the highest order value and increment by 1
      const maxOrderResult = await prisma.featureSliderSlide.aggregate({
        _max: {
          order: true,
        },
        where: {
          tenantId: tenantId,
        },
      });
      
      const newOrder = (maxOrderResult._max.order || 0) + 1;
      
      const slide = await prisma.featureSliderSlide.create({
        data: {
          tenantId: tenantId,
          title: slideData.title,
          description: slideData.description,
          icon: slideData.icon,
          imageUrl: slideData.imageUrl || null,
          enabled: slideData.enabled !== undefined ? slideData.enabled : true,
          order: newOrder,
        },
      });
      
      return slide;
    } catch (error) {
      throw new Error(`Failed to create feature slider slide: ${error.message}`);
    }
  }

  /**
   * Update a feature slider slide
   * @param {string} tenantId - Tenant ID
   * @param {string} slideId - Slide ID
   * @param {Object} slideData - Slide data to update
   * @returns {Promise<Object>} Updated slide
   */
  async updateSlide(tenantId, slideId, slideData) {
    try {
      const slide = await prisma.featureSliderSlide.update({
        where: {
          id: slideId,
          tenantId: tenantId,
        },
        data: {
          title: slideData.title,
          description: slideData.description,
          icon: slideData.icon,
          imageUrl: slideData.imageUrl,
          enabled: slideData.enabled,
          order: slideData.order,
        },
      });
      
      return slide;
    } catch (error) {
      throw new Error(`Failed to update feature slider slide: ${error.message}`);
    }
  }

  /**
   * Delete a feature slider slide
   * @param {string} tenantId - Tenant ID
   * @param {string} slideId - Slide ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteSlide(tenantId, slideId) {
    try {
      await prisma.featureSliderSlide.delete({
        where: {
          id: slideId,
          tenantId: tenantId,
        },
      });
      
      // Reorder remaining slides
      await this.reorderSlides(tenantId);
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete feature slider slide: ${error.message}`);
    }
  }

  /**
   * Reorder feature slider slides
   * @param {string} tenantId - Tenant ID
   * @param {Array<string>} slideIds - Array of slide IDs in new order
   * @returns {Promise<Array>} Updated slides
   */
  async reorderSlides(tenantId, slideIds) {
    try {
      // If no slide IDs provided, just resequence all slides
      if (!slideIds) {
        const slides = await prisma.featureSliderSlide.findMany({
          where: {
            tenantId: tenantId,
          },
          orderBy: {
            order: 'asc',
          },
        });
        
        slideIds = slides.map(slide => slide.id);
      }
      
      // Update order for each slide
      const updates = slideIds.map((slideId, index) => {
        return prisma.featureSliderSlide.update({
          where: {
            id: slideId,
            tenantId: tenantId,
          },
          data: {
            order: index + 1,
          },
        });
      });
      
      const updatedSlides = await Promise.all(updates);
      return updatedSlides;
    } catch (error) {
      throw new Error(`Failed to reorder feature slider slides: ${error.message}`);
    }
  }

  /**
   * Initialize default slides for a tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Array>} Array of created slides
   */
  async initializeDefaultSlides(tenantId) {
    try {
      // Check if slides already exist for this tenant
      const existingSlidesCount = await prisma.featureSliderSlide.count({
        where: {
          tenantId: tenantId,
        },
      });
      
      if (existingSlidesCount > 0) {
        return [];
      }
      
      // Default slides
      const defaultSlides = [
        {
          title: "Secure Digital Document Storage",
          description: "Store all your important documents securely in the cloud with enterprise-grade encryption and access controls for maximum protection.",
          icon: "lock",
          order: 1,
        },
        {
          title: "Smart Search and Tagging",
          description: "Find documents instantly with AI-powered search and intelligent tagging systems that categorize your content automatically.",
          icon: "search",
          order: 2,
        },
        {
          title: "Team Collaboration & Access Control",
          description: "Collaborate seamlessly with your team while maintaining granular control over who can access, edit, or share documents.",
          icon: "users",
          order: 3,
        },
      ];
      
      // Create default slides
      const slides = await Promise.all(
        defaultSlides.map(async (slide, index) => {
          return await prisma.featureSliderSlide.create({
            data: {
              tenantId: tenantId,
              title: slide.title,
              description: slide.description,
              icon: slide.icon,
              enabled: true,
              order: slide.order,
            },
          });
        })
      );
      
      return slides;
    } catch (error) {
      throw new Error(`Failed to initialize default feature slider slides: ${error.message}`);
    }
  }
}

export default new FeatureSliderService();