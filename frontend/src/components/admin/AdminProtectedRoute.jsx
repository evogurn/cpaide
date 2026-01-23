import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/authUtils';

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking auth status to prevent flashing
  if (loading) {
    return null; // or you can return a loading spinner component
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is an admin
  if (!isAdmin()) {
    // Redirect to dashboard if user is not an admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;