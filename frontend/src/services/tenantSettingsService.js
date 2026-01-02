import api from '../utils/api';

/**
 * Tenant Settings Service
 * Handles tenant-specific settings like folder templates
 */

/**
 * Get folder template
 * @returns {Promise} Folder template data
 */
export const getFolderTemplate = async (tenantId) => {
  try {
    const response = await api.get(`/tenants/${tenantId}/folder-template`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching folder template:', error);
    throw error;
  }
};

/**
 * Update folder template
 * @param {Array} template - Folder template data
 * @returns {Promise} Updated folder template
 */
export const updateFolderTemplate = async (tenantId, template) => {
  try {
    const response = await api.patch(`/tenants/${tenantId}/folder-template`, { template });
    return response.data.data;
  } catch (error) {
    console.error('Error updating folder template:', error);
    throw error;
  }
};

/**
 * Initialize folders for tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise} Initialization result
 */
export const initializeTenantFolders = async (tenantId) => {
  try {
    const response = await api.post(`/tenants/${tenantId}/initialize-folders`);
    return response.data.data;
  } catch (error) {
    console.error('Error initializing tenant folders:', error);
    throw error;
  }
};

export default {
  getFolderTemplate,
  updateFolderTemplate,
  initializeTenantFolders
};