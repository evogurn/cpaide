import api from '../utils/api';

/**
 * Get current user profile (includes tenant information)
 * @returns {Promise<Object>} User profile data with tenant information
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data; // Extract data from the response structure
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

/**
 * Get current user's tenant information
 * @returns {Promise<Object>} Tenant details
 */
export const getMyTenant = async () => {
  try {
    const response = await api.get('/auth/me');
    // Return just the tenant data from the user profile response
    return {
      tenant: response.data.data.tenant,
      user: {
        id: response.data.data.id,
        firstName: response.data.data.firstName,
        lastName: response.data.data.lastName,
        email: response.data.data.email
      }
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tenant information');
  }
};

export default {
  getCurrentUser,
  getMyTenant
};