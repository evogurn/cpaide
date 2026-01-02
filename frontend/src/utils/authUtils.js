/**
 * Authentication utility functions
 */
import api from './api';

// Token storage key
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Store authentication token
 * @param {string} token - Authentication token
 */
export const storeToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get authentication token
 * @returns {string|null} Authentication token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store user info
 * @param {Object} user - User object
 */
export const storeUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get user info
 * @returns {Object|null} User object or null if not found
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Remove user info
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Remove all authentication data
 */
export const removeAllAuthData = () => {
  removeToken();
  removeUser();
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token; // Simple check - in a real app, you might want to validate the token
};

/**
 * Login API call
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>} Login result
 */
export const login = async (email, password) => {
  try {
    console.log('Attempting login with:', { email, password });
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response);
    
    if (response.data && response.data.data) {
      const { accessToken, user } = response.data.data;
      
      // Store token and user info
      storeToken(accessToken);
      storeUser(user);
      
      return { success: true, data: { token: accessToken, user } };
    }
    
    return { success: false, error: 'Invalid response from server' };
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    return { success: false, error: errorMessage };
  }
};

/**
 * Logout function
 */
export const logout = () => {
  removeAllAuthData();
  
  // Call logout API endpoint
  api.post('/auth/logout').catch(() => {
    // Ignore errors during logout
  });
};