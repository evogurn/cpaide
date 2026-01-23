import api from '../utils/api.js';

class FolderTemplateService {
  /**
   * Get all folder templates
   */
  async getAllTemplates(params = {}) {
    const response = await api.get('/folder-templates', { params });
    return response.data;
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    const response = await api.get(`/folder-templates/${id}`);
    return response.data;
  }

  /**
   * Get templates by industry
   */
  async getTemplatesByIndustry(industry) {
    const response = await api.get(`/folder-templates/industry/${industry}`);
    return response.data;
  }

  /**
   * Create a new folder template (Master Admin only)
   */
  async createTemplate(templateData) {
    const response = await api.post('/folder-templates', templateData);
    return response.data;
  }

  /**
   * Update a folder template (Master Admin only)
   */
  async updateTemplate(id, templateData) {
    const response = await api.put(`/folder-templates/${id}`, templateData);
    return response.data;
  }

  /**
   * Delete a folder template (Master Admin only)
   */
  async deleteTemplate(id) {
    const response = await api.delete(`/folder-templates/${id}`);
    return response.data;
  }

  /**
   * Apply a template to the current tenant
   */
  async applyTemplateToTenant(id, placeholderValues = {}) {
    const response = await api.post(`/folder-templates/${id}/apply`, { placeholderValues });
    return response.data;
  }
}

export default new FolderTemplateService();