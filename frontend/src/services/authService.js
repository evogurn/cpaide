import api from '../utils/api';

/**
 * Initiate OTP verification for registration
 * @param {Object} data - Registration data
 * @param {string} data.userType - 'tenant' or 'user'
 * @param {string} data.email - User email
 * @param {Object} data.payload - Registration payload to store temporarily
 * @param {string} [data.tenantId] - Tenant ID (required for user registration)
 * @returns {Promise<Object>} Initiation result
 */
export const initiateOtp = async (data) => {
  try {
    const response = await api.post('/auth/otp/initiate', data);
    
    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }
    
    throw new Error('Failed to initiate OTP verification');
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'OTP initiation failed';
    return { success: false, error: errorMessage };
  }
};

/**
 * Verify OTP
 * @param {Object} data - OTP verification data
 * @param {string} data.email - User email
 * @param {string} data.otp - 6-digit OTP
 * @param {string} data.verificationToken - Verification token
 * @returns {Promise<Object>} Verification result
 */
export const verifyOtp = async (data) => {
  try {
    const response = await api.post('/auth/otp/verify', data);
    
    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }
    
    throw new Error('Failed to verify OTP');
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
    return { success: false, error: errorMessage };
  }
};

/**
 * Resend OTP
 * @param {Object} data - Resend data
 * @param {string} data.verificationToken - Previous verification token
 * @returns {Promise<Object>} Resend result
 */
export const resendOtp = async (data) => {
  try {
    const response = await api.post('/auth/otp/resend', data);
    
    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }
    
    throw new Error('Failed to resend OTP');
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'OTP resend failed';
    return { success: false, error: errorMessage };
  }
};

/**
 * Register a new tenant with admin user (deprecated - use OTP flow instead)
 * @deprecated Use initiateOtp with userType 'tenant' instead
 */
export const registerTenant = async (data) => {
  try {
    const response = await api.post('/auth/register/tenant', {
      tenantName: data.tenantName,
      adminFirstName: data.adminFirstName,
      adminLastName: data.adminLastName,
      adminEmail: data.adminEmail,
      adminPassword: data.adminPassword,
    });
    
    if (response.data && response.data.data) {
      return {
        success: true,
        data: {
          tenant: response.data.data.tenant,
          user: response.data.data.user,
          accessToken: response.data.data.accessToken,
        },
      };
    }
    
    throw new Error('Failed to register tenant and admin user');
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
    return { success: false, error: errorMessage };
  }
};

/**
 * Register a new user for an existing tenant (deprecated - use OTP flow instead)
 * @deprecated Use initiateOtp with userType 'user' instead
 */
export const registerUser = async (data) => {
  try {
    const response = await api.post('/auth/register', {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      tenantId: data.tenantId,
    });
    
    if (response.data && response.data.data) {
      return {
        success: true,
        data: {
          user: response.data.data.user,
          accessToken: response.data.data.accessToken,
        },
      };
    }
    
    throw new Error('Failed to register user');
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
    return { success: false, error: errorMessage };
  }
};

/**
 * Generate a user invitation link
 * @param {string} tenantId - Tenant ID
 * @param {string} tenantName - Tenant name
 * @returns {string} Invitation link
 */
export const generateInvitationLink = (tenantId, tenantName) => {
  // In a real application, this would make an API call to generate a secure token
  // For now, we'll generate a client-side link with tenant information
  const baseUrl = window.location.origin;
  const encodedTenantName = encodeURIComponent(tenantName);
  return `${baseUrl}/register/user?tenantId=${tenantId}&tenant=${encodedTenantName}`;
};

/**
 * Note: Tenant registration requires SUPER_ADMIN privileges and cannot be done through the frontend
 * by regular users. Tenants are typically created by system administrators.
 */