/**
 * Authentication utility functions
 */
import api from './api';

// Token storage key
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REMEMBER_ME_KEY = 'remember_me';

/**
 * Store authentication token
 * @param {string} token - Authentication token
 */
export const storeToken = (token) => {
  // Check if remember me is enabled to determine storage location
  if (typeof Storage !== 'undefined') {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
    const shouldRemember = rememberMe ? JSON.parse(rememberMe) : true; // Default to true
    
    if (shouldRemember) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  }
};

/**
 * Get authentication token
 * @returns {string|null} Authentication token or null if not found
 */
export const getToken = () => {
  // Check localStorage first (persistent storage)
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    // If not found, check sessionStorage (session storage)
    token = sessionStorage.getItem(TOKEN_KEY);
  }
  return token;
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
  sessionStorage.removeItem(TOKEN_KEY);
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
  removeRememberMe();
};

/**
 * Store remember me preference
 * @param {boolean} remember - Whether to remember the user
 */
export const storeRememberMe = (remember) => {
  localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(!!remember));
};

/**
 * Get remember me preference
 * @returns {boolean} True if remember me is enabled, false otherwise
 */
export const getRememberMe = () => {
  const remember = localStorage.getItem(REMEMBER_ME_KEY);
  return remember ? JSON.parse(remember) : false;
};

/**
 * Remove remember me preference
 */
export const removeRememberMe = () => {
  localStorage.removeItem(REMEMBER_ME_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  // Check both localStorage and sessionStorage for auth token using getToken
  const token = getToken();
  return !!token; // Simple check - in a real app, you might want to validate the token
};

/**
 * Login API call
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to remember the user session
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>} Login result
 */
export const login = async (email, password, rememberMe = false) => {
  try {
    console.log('Attempting login with:', { email, password, rememberMe });
    const response = await api.post('/auth/login', { email, password, rememberMe });
    console.log('Login response:', response);
    
    if (response.data && response.data.data) {
      const { accessToken, user } = response.data.data;
      
      // Store remember me preference FIRST so storeToken knows where to save
      storeRememberMe(!!rememberMe);
      
      // Store token and user info
      storeToken(accessToken);
      storeUser(user);
      
      return { success: true, data: { token: accessToken, user } };
    }
    
    return { success: false, error: 'Invalid Credentials' };
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

/**
 * Attempt to restore authentication by refreshing the token if needed
 * @returns {Promise<boolean>} True if authentication was restored, false otherwise
 */
export const restoreAuthSession = async () => {
  try {
    // Check if we have a token (either in localStorage or sessionStorage)
    const token = getToken();
    
    if (!token) {
      // No token available, can't restore session
      return false;
    }
    
    // If we have a token, try to get user info to verify it's still valid
    const response = await api.get('/auth/me');
    
    if (response.data && response.data.success && response.data.data) {
      // Token is valid, store user info
      storeUser(response.data.data);
      return true;
    }
    
    return false;
  } catch (error) {
    // If the token is invalid/expired, the API call will trigger a refresh
    // This might result in an automatic redirect to login
    console.error('Error restoring auth session:', error);
    return false;
  }
};

/**
 * Check if user has admin privileges
 * @returns {boolean} True if user is an admin, false otherwise
 */
export const isAdmin = () => {
  const user = getUser();
  if (!user) return false;
  
  // Check if user has SUPER_ADMIN role
  if (user.userRoles && Array.isArray(user.userRoles)) {
    return user.userRoles.some(role => 
      role.role && role.role.name === 'SUPER_ADMIN'
    );
  }
  
  return false;
};