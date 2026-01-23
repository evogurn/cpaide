import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DocumentExplorer from './pages/DocumentExplorer';
import UploadDocument from './pages/UploadDocument';
import SearchPage from './pages/SearchPage';
import UserManagementPage from './pages/UserManagement';
import Settings from './pages/Settings';
import Billing from './pages/Upgrade';
import RecycleBin from './pages/RecycleBin';
import History from './pages/History';
import ProfilePage from './pages/ProfilePage';
import Support from './pages/Support';
import Login from './pages/auth/Login';
import TenantRegister from './pages/auth/TenantRegister';
import UserRegister from './pages/auth/UserRegister';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminRoute from './pages/admin/AdminRoute';
import MasterAdminDashboard from './pages/admin/MasterAdminDashboard';
import TenantManagement from './pages/admin/TenantManagement';
import AdminUserManagement from './pages/admin/UserManagement';
import BillingManagement from './pages/admin/BillingManagement';
import SupportManagement from './pages/admin/Support';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminSettings from './pages/admin/AdminSettings';
import FolderTemplateManager from './components/admin/FolderTemplateManager';
import { applyTheme, applyThemeMode, getSavedTheme } from './utils/themeUtils';

// Apply theme immediately when the app loads
const savedTheme = getSavedTheme();
applyTheme(
  savedTheme?.accentColor || '#3b82f6',
  savedTheme?.backgroundColor || '#f9fafb'
);

// Apply theme mode
applyThemeMode(savedTheme?.themeMode || 'light');

function App() {
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    // Set theme as loaded after initial render
    setThemeLoaded(true);
  }, []);

  if (!themeLoaded) {
    return null; // or a loading spinner
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register/tenant" element={<TenantRegister />} />
        <Route path="/register/user" element={<UserRegister />} />
        
        {/* Protected routes - wrapped with ProtectedRoute at the route level */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/explorer" element={
          <ProtectedRoute>
            <Layout>
              <DocumentExplorer />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <Layout>
              <UploadDocument />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <Layout>
              <SearchPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <Layout>
              <UserManagementPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute>
            <Layout>
              <Billing />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/recycle-bin" element={
          <ProtectedRoute>
            <Layout>
              <RecycleBin />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <Layout>
              <Support />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin routes - wrapped with AdminProtectedRoute */}
        <Route path="/cpaide/admin" element={
          <AdminProtectedRoute>
            <AdminRoute />
          </AdminProtectedRoute>
        }>
          <Route path="" element={<MasterAdminDashboard />} />
          <Route path="dashboard" element={<MasterAdminDashboard />} />
          <Route path="tenants" element={<TenantManagement />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="billing" element={<BillingManagement />} />
          <Route path="support" element={<SupportManagement />} />
          <Route path="logs" element={<ActivityLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="folder-templates" element={<FolderTemplateManager />} />
          <Route path="*" element={<Navigate to="/cpaide/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;