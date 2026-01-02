import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getUser, removeAllAuthData } from '../utils/authUtils';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    // Set loading to true when checking auth status
    setLoading(true);
    
    const authStatus = isAuthenticated();
    const userData = getUser();
    
    setIsAuthenticatedState(authStatus);
    setUser(userData);
    setLoading(false);
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