import api from '../utils/api';

/**
 * Get all tenants with pagination, filtering, and search
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term
 * @param {string} params.status - Filter by status
 * @param {string} params.approvalStatus - Filter by approval status
 * @returns {Promise<Object>} Paginated tenants data
 */
export const getAllTenants = async (params = {}) => {
  try {
    const response = await api.get('/admin/tenants', { params });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tenants');
  }
};

/**
 * Get pending tenants with pagination and search
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term
 * @returns {Promise<Object>} Paginated pending tenants data
 */
export const getPendingTenants = async (params = {}) => {
  try {
    const response = await api.get('/admin/tenants/pending', { params });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch pending tenants');
  }
};

/**
 * Approve a tenant
 * @param {string} tenantId - ID of the tenant to approve
 * @returns {Promise<Object>} Updated tenant data
 */
export const approveTenant = async (tenantId) => {
  try {
    const response = await api.patch(`/admin/tenants/${tenantId}/approve`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve tenant');
  }
};

/**
 * Reject a tenant
 * @param {string} tenantId - ID of the tenant to reject
 * @returns {Promise<Object>} Updated tenant data
 */
export const rejectTenant = async (tenantId) => {
  try {
    const response = await api.patch(`/admin/tenants/${tenantId}/reject`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reject tenant');
  }
};

/**
 * Update tenant status
 * @param {string} tenantId - ID of the tenant to update
 * @param {string} status - New status (ACTIVE, SUSPENDED, INACTIVE)
 * @returns {Promise<Object>} Updated tenant data
 */
export const updateTenantStatus = async (tenantId, status) => {
  try {
    const response = await api.patch(`/admin/tenants/${tenantId}/status`, { status });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update tenant status');
  }
};

/**
 * Update tenant details
 * @param {string} tenantId - ID of the tenant to update
 * @param {Object} data - Updated tenant data
 * @returns {Promise<Object>} Updated tenant data
 */
export const updateTenant = async (tenantId, data) => {
  try {
    const response = await api.patch(`/admin/tenants/${tenantId}`, data);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update tenant');
  }
};

/**
 * Get all users with pagination, filtering, and search
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

/**
 * Create user (Admin)
 */
export const createUserAdmin = async (data) => {
  try {
    const response = await api.post('/admin/users', data);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create user');
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user status');
  }
};

/**
 * Reset user password
 */
export const resetUserPassword = async (userId, password) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/password`, { password });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
};

/**
 * Update user (Admin)
 */
export const updateUserAdmin = async (userId, data) => {
  try {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

/**
 * Delete user (Admin)
 */
export const deleteUserAdmin = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

// Billing-related functions

/**
 * Get all billing plans
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term
 * @param {boolean} params.isActive - Filter by active status
 * @returns {Promise<Object>} Paginated billing plans data
 */
export const getAllBillingPlans = async (params = {}) => {
  try {
    const response = await api.get('/admin/billing/plans', { params });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch billing plans');
  }
};

/**
 * Create or update a billing plan
 * @param {Object} planData - Billing plan data
 * @param {string} [planData.id] - Plan ID (if updating)
 * @param {string} planData.name - Plan name
 * @param {string} planData.displayName - Plan display name
 * @param {string} planData.description - Plan description
 * @param {number} planData.price - Plan price
 * @param {string} planData.currency - Currency code
 * @param {string} planData.interval - Billing interval (MONTHLY/YEARLY)
 * @param {Object} planData.features - Plan features
 * @param {Object} planData.limits - Plan limits
 * @param {boolean} planData.isActive - Whether the plan is active
 * @returns {Promise<Object>} Updated billing plan data
 */
export const upsertBillingPlan = async (planData) => {
  try {
    let response;
    if (planData.id) {
      // Update existing plan
      response = await api.put(`/admin/billing/plans/${planData.id}`, planData);
    } else {
      // Create new plan
      response = await api.post('/admin/billing/plans', planData);
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to save billing plan');
  }
};

/**
 * Delete a billing plan
 * @param {string} planId - ID of the billing plan to delete
 * @returns {Promise<Object>} Success response
 */
export const deleteBillingPlan = async (planId) => {
  try {
    const response = await api.delete(`/admin/billing/plans/${planId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete billing plan');
  }
};

/**
 * Update tenant pricing
 * @param {string} tenantId - ID of the tenant
 * @param {Object} pricingData - Pricing data

 * @param {number} [pricingData.discountPercent] - Discount percentage
 * @param {number} [pricingData.discountFixedAmount] - Fixed discount amount
 * @param {Date} [pricingData.discountExpiry] - Discount expiry date
 * @returns {Promise<Object>} Updated tenant data
 */
export const updateTenantPricing = async (tenantId, pricingData) => {
  try {
    const response = await api.patch(`/admin/tenants/${tenantId}/pricing`, pricingData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update tenant pricing');
  }
};

/**
 * Get tenant billing information
 * @param {string} tenantId - ID of the tenant
 * @returns {Promise<Object>} Tenant billing information
 */
export const getTenantBillingInfo = async (tenantId) => {
  try {
    const response = await api.get(`/admin/tenants/${tenantId}/billing`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tenant billing information');
  }
};

/**
 * Get tenant discount history
 * @param {string} tenantId - ID of the tenant
 * @returns {Promise<Object>} Tenant discount history
 */
export const getTenantDiscountHistory = async (tenantId) => {
  try {
    const response = await api.get(`/tenants/${tenantId}/discount-history`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tenant discount history');
  }
};

export default {
  getAllTenants,
  getPendingTenants,
  approveTenant,
  rejectTenant,
  updateTenantStatus,
  updateTenant,
  getAllUsers,
  updateUserStatus,
  createUserAdmin,
  resetUserPassword,
  updateUserAdmin,
  deleteUserAdmin,
  getAllBillingPlans,
  upsertBillingPlan,
  deleteBillingPlan,
  updateTenantPricing,
  getTenantBillingInfo,
  getTenantDiscountHistory
};