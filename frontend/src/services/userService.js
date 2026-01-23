import api from '../utils/api';

/**
 * Get users for current tenant
 */
export const listUsers = async (params = {}) => {
  try {
    const response = await api.get('/users', { params });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

/**
 * Create user
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create user');
  }
};

/**
 * Update user
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.patch(`/users/${userId}`, userData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

/**
 * Assign roles to user
 */
export const assignRoles = async (userId, roleIds) => {
  try {
    const response = await api.post(`/users/${userId}/roles`, { roleIds });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to assign roles');
  }
};

/**
 * List roles
 */
export const listRoles = async () => {
  try {
    const response = await api.get('/users/roles');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch roles');
  }
};

/**
 * List permissions
 */
export const listPermissions = async () => {
  try {
    const response = await api.get('/users/permissions');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch permissions');
  }
};

export default {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  assignRoles,
  listRoles,
  listPermissions
};
