import api from '../utils/api';

export const folderService = {
  // Get folder tree
  async getFolderTree() {
    try {
      const response = await api.get('/folders/tree');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching folder tree:', error);
      throw error;
    }
  },

  // Create a new folder
  async createFolder(folderData) {
    try {
      const response = await api.post('/folders', folderData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  // Get a specific folder by ID
  async getFolderById(folderId) {
    try {
      const response = await api.get(`/folders/${folderId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching folder:', error);
      throw error;
    }
  },

  // Update a folder
  async updateFolder(folderId, updateData) {
    try {
      const response = await api.patch(`/folders/${folderId}`, updateData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  },

  // Delete a folder
  async deleteFolder(folderId) {
    try {
      const response = await api.delete(`/folders/${folderId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  },

  // Move a folder to a new parent
  async moveFolder(folderId, targetParentId) {
    try {
      const response = await api.post(`/folders/${folderId}/move`, { targetParentId });
      return response.data.data;
    } catch (error) {
      console.error('Error moving folder:', error);
      throw error;
    }
  },

  // Rename a folder
  async renameFolder(folderId, name) {
    try {
      const response = await api.patch(`/folders/${folderId}/rename`, { name });
      return response.data.data;
    } catch (error) {
      console.error('Error renaming folder:', error);
      throw error;
    }
  },

};