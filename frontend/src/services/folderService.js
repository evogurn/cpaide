import api from '../utils/api';

/**
 * Folder Service
 * Handles all folder-related API calls
 */

/**
 * Get folder structure
 * @returns {Promise} Folder structure data
 */
export const getFolders = async () => {
  try {
    const response = await api.get('/folders');
    return response.data.data.folders;
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw error;
  }
};

/**
 * Get all folders for tenant (flat list)
 * @returns {Promise} All folders data
 */
export const getAllFolders = async () => {
  try {
    const response = await api.get('/folders/all');
    return response.data.data.folders;
  } catch (error) {
    console.error('Error fetching all folders:', error);
    throw error;
  }
};

/**
 * Create a new folder
 * @param {Object} folderData - Folder data
 * @returns {Promise} Created folder data
 */
export const createFolder = async (folderData) => {
  try {
    const response = await api.post('/folders', folderData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

/**
 * Update folder name
 * @param {string} folderId - Folder ID
 * @param {Object} updateData - Update data
 * @returns {Promise} Updated folder data
 */
export const updateFolder = async (folderId, updateData) => {
  try {
    const response = await api.patch(`/folders/${folderId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

/**
 * Move folder to a different parent
 * @param {string} folderId - Folder ID
 * @param {string} targetParentId - Target parent folder ID
 * @returns {Promise} Moved folder data
 */
export const moveFolder = async (folderId, targetParentId) => {
  try {
    const response = await api.post(`/folders/${folderId}/move`, {
      targetParentId: targetParentId || null
    });
    return response.data.data;
  } catch (error) {
    console.error('Error moving folder:', error);
    throw error;
  }
};

/**
 * Delete folder
 * @param {string} folderId - Folder ID
 * @returns {Promise} Deletion result
 */
export const deleteFolder = async (folderId) => {
  try {
    const response = await api.delete(`/folders/${folderId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

/**
 * Get folder by ID
 * @param {string} folderId - Folder ID
 * @returns {Promise} Folder data
 */
export const getFolderById = async (folderId) => {
  try {
    const response = await api.get(`/folders/${folderId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching folder:', error);
    throw error;
  }
};

export default {
  getFolders,
  getAllFolders,
  createFolder,
  updateFolder,
  moveFolder,
  deleteFolder,
  getFolderById
};