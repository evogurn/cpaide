import api from '../utils/api';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const documentService = {
  // Rename a document
  async renameDocument(documentId, name) {
    try {
      const response = await api.patch(`/documents/${documentId}/rename`, { name });
      return response.data.data;
    } catch (error) {
      console.error('Error renaming document:', error);
      throw error;
    }
  },

  // Move a document to a new folder
  async moveDocument(documentId, targetFolderId) {
    try {
      const response = await api.post(`/documents/${documentId}/move`, { targetFolderId });
      return response.data.data;
    } catch (error) {
      console.error('Error moving document:', error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(documentId) {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Upload a document
  async uploadDocument({ file, title, description, tags, folderId }) {
    try {
      // Use direct upload to backend to avoid CORS issues
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('description', description);
      formData.append('tags', tags || '');
      if (folderId) {
        formData.append('folderId', folderId);
      }

      // Get auth token for the upload request
      let token = localStorage.getItem('auth_token');
      if (!token) {
        token = sessionStorage.getItem('auth_token');
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/document-upload/direct-upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      const { objectKey, fileName, size, mimeType } = response.data.data;

      // Create document metadata in the database
      const documentData = {
        name: title || fileName,
        originalName: fileName,
        mimeType,
        size,
        storageKey: objectKey,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        metadata: { description },
      };
      
      // Only add folderId if it's provided (not null/undefined)
      if (folderId) {
        documentData.folderId = folderId;
      }

      const metadataResponse = await api.post(`/documents`, documentData);

      return metadataResponse.data.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Get documents by folder
  async getDocumentsByFolder(folderId = null) {
    try {
      const params = folderId ? { folderId } : {};
      const response = await api.get(`/documents`, { params });
      // The API returns data in response.data.data.documents
      return response.data?.data?.documents || [];
    } catch (error) {
      console.error('Error fetching documents by folder:', error);
      // Return empty array in case of error
      return [];
    }
  },

  // Get download URL for a document
  async getDownloadUrl(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/download`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  },
};