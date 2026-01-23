import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for cookies
});

// Function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const rememberMe = localStorage.getItem('remember_me');
    const shouldRemember = rememberMe ? JSON.parse(rememberMe) : true;
    
    // The refresh token is sent as an HTTP-only cookie, so we don't need to manually include it
    // But we send rememberMe so the backend knows whether to make the new cookie persistent
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
      { rememberMe: shouldRemember },
      {
        withCredentials: true, // This ensures cookies are sent with the request
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success && response.data.data.accessToken) {
      // Check if remember me is enabled to determine storage location
      if (typeof Storage !== 'undefined') {
        if (shouldRemember) {
          localStorage.setItem('auth_token', response.data.data.accessToken);
        } else {
          sessionStorage.setItem('auth_token', response.data.data.accessToken);
        }
      }
      return response.data.data.accessToken;
    } else {
      throw new Error('Token refresh failed');
    }
  } catch (error) {
    // If refresh fails, clear tokens and redirect to login
    localStorage.removeItem('auth_token');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw error;
  }
};

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage for auth token
    let token = localStorage.getItem('auth_token');
    if (!token) {
      token = sessionStorage.getItem('auth_token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized access (401) - token might be expired
    if (error.response?.status === 401) {
      // Check if this is a token refresh request to avoid infinite loop
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh the access token
          const newToken = await refreshAccessToken();
          
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, remove tokens and redirect to login
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // If already retried, redirect to login
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    // For 403 Forbidden errors, don't redirect to login
    // The user is authenticated but lacks permission
    if (error.response?.status === 403) {
      // Don't redirect to login, just reject the promise
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default api;