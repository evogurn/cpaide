import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminRoute = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminRoute;