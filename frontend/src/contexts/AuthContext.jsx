import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getUser, removeAllAuthData, getToken, restoreAuthSession } from '../utils/authUtils';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on app load
  useEffect(() => {
    initializeAuthState();
  }, []);

  const checkAuthStatus = () => {
    // Set loading to true when checking auth status
    setLoading(true);
    
    // Check if we have a token in either localStorage or sessionStorage
    let token = localStorage.getItem('auth_token');
    if (!token) {
      token = sessionStorage.getItem('auth_token');
    }
    
    const authStatus = !!token; // isAuthenticated() may not work correctly with mixed storage
    const userData = getUser();
    
    setIsAuthenticatedState(authStatus);
    setUser(userData);
    setLoading(false);
  };
  
  const initializeAuthState = async () => {
    // Set loading to true when initializing auth state
    setLoading(true);
    
    try {
      // Try to restore the auth session by verifying the token and potentially refreshing it
      const sessionRestored = await restoreAuthSession();
      
      if (sessionRestored) {
        // Session was successfully restored
        const userData = getUser();
        setIsAuthenticatedState(true);
        setUser(userData);
      } else {
        // Check if we have a token but it couldn't be verified/restored
        let token = localStorage.getItem('auth_token');
        if (!token) {
          token = sessionStorage.getItem('auth_token');
        }
        
        const authStatus = !!token;
        const userData = getUser();
        
        setIsAuthenticatedState(authStatus);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      // Fallback to basic auth check
      let token = localStorage.getItem('auth_token');
      if (!token) {
        token = sessionStorage.getItem('auth_token');
      }
      
      const authStatus = !!token;
      const userData = getUser();
      
      setIsAuthenticatedState(authStatus);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };


  const login = (userData) => {
    setUser(userData);
    setIsAuthenticatedState(true);
    setLoading(false);
  };

  const logout = () => {
    removeAllAuthData();
    setUser(null);
    setIsAuthenticatedState(false);
    setLoading(false);
  };

  const value = {
    user,
    isAuthenticated: isAuthenticatedState,
    loading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;