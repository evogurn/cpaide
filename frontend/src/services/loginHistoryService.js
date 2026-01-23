import api from '../utils/api';

export const loginHistoryService = {
  // Get login history for current user
  getUserLoginHistory: async (params = {}) => {
    const response = await api.get('/login-history/user', { params });
    return response.data;
  },

  // Get login history for a tenant (admin access required)
  getTenantLoginHistory: async (params = {}) => {
    const response = await api.get('/login-history/tenant', { params });
    return response.data;
  },
};