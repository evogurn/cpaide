import React from 'react';
import { Link } from 'react-router-dom';

const MasterAdminDashboard = () => {
  const stats = {
    totalTenants: 12,
    activeTenants: 10,
    pendingTenants: 2,
    totalUsers: 156,
    totalRevenue: '$12,450',
    activeTickets: 8
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
          Admin Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
          Welcome back! Here's what's happening with your application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                Total Tenants
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
                {stats.totalTenants}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                Active Tenants
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
                {stats.activeTenants}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                Pending
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
                {stats.pendingTenants}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                Total Users
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/cpaide/admin/tenants"
            className="bg-gray-50 dark:bg-dark-bg-tertiary p-4 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors duration-200"
          >
            <div className="flex justify-center mb-2">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">
              Manage Tenants
            </h4>
          </Link>
          <Link
            to="/cpaide/admin/users"
            className="bg-gray-50 dark:bg-dark-bg-tertiary p-4 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors duration-200"
          >
            <div className="flex justify-center mb-2">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">
              Manage Users
            </h4>
          </Link>
          <Link
            to="/cpaide/admin/billing"
            className="bg-gray-50 dark:bg-dark-bg-tertiary p-4 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors duration-200"
          >
            <div className="flex justify-center mb-2">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">
              Billing
            </h4>
          </Link>
          <Link
            to="/cpaide/admin/support"
            className="bg-gray-50 dark:bg-dark-bg-tertiary p-4 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors duration-200"
          >
            <div className="flex justify-center mb-2">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">
              Support Tickets
            </h4>
          </Link>
          <Link
            to="/cpaide/admin/folder-templates"
            className="bg-gray-50 dark:bg-dark-bg-tertiary p-4 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors duration-200"
          >
            <div className="flex justify-center mb-2">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">
              Folder Templates
            </h4>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                <span className="text-blue-800 dark:text-blue-300 text-sm">T</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                New tenant registered
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                ABC Construction - 2 hours ago
              </p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                <span className="text-green-800 dark:text-green-300 text-sm">U</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                User created
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                John Doe (ABC Construction) - 4 hours ago
              </p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900/30">
                <span className="text-purple-800 dark:text-purple-300 text-sm">S</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                Support ticket created
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                Billing issue - 6 hours ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAdminDashboard;