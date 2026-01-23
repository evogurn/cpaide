import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import AdminNotifications from './AdminNotifications';
import { notificationService } from '../../services/notificationService';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef(null);
  const location = useLocation();

  // Fetch unread notifications count
  useEffect(() => { 
    const fetchUnreadCount = async () => {
      try {
        // For master admin, use system notifications count
        const response = await notificationService.getSystemUnreadCount();
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch unread notifications count:', error);
      }
    };

    if (notificationsOpen) {
      fetchUnreadCount();
    }
  }, [notificationsOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/cpaide/admin', icon: 'dashboard' },
    { id: 'tenants', label: 'Tenants', path: '/cpaide/admin/tenants', icon: 'tenants' },
    { id: 'users', label: 'Users', path: '/cpaide/admin/users', icon: 'users' },
    { id: 'billing', label: 'Billing', path: '/cpaide/admin/billing', icon: 'billing' },
    { id: 'support', label: 'Support', path: '/cpaide/admin/support', icon: 'support' },
    { id: 'folder-templates', label: 'Folder Templates', path: '/cpaide/admin/folder-templates', icon: 'folder-templates' },
    { id: 'logs', label: 'Activity Logs', path: '/cpaide/admin/logs', icon: 'logs' },
    { id: 'admin-settings', label: 'System Settings', path: '/cpaide/admin/settings', icon: 'settings' }
  ];

  const isActive = (path) => {
    // Special case for dashboard - only match exact path
    if (path === '/cpaide/admin') {
      return location.pathname === path;
    }
    // For other paths, check exact match or starts with path + '/'
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-secondary">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 w-64 bg-white dark:bg-dark-bg-primary shadow-lg">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                  Admin Panel
                </h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-dark-text-secondary"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          isActive(item.path)
                            ? 'bg-accent text-accent-contrast'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-dark-text-primary dark:hover:bg-dark-bg-tertiary'
                        }`}
                      >
                        <div className="mr-3 w-5 h-5">
                          {item.icon === 'dashboard' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 9 9-9 9-7-7zm3 5l4 4M3 12l6.5 6.5M21 12l-2.5-2.5m-10 7.5l4-4m6.5 6.5l-4-4" />
                            </svg>
                          )}
                          {item.icon === 'tenants' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                          {item.icon === 'users' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          )}
                          {item.icon === 'billing' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          )}
                          {item.icon === 'support' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          )}
                          {item.icon === 'logs' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          {item.icon === 'settings' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                          {item.icon === 'folder-templates' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          )}
                        </div>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-64 bg-white dark:bg-dark-bg-primary shadow-md border-r border-gray-200 dark:border-dark-border">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-dark-border">
              <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                Master Admin
              </h1>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                CPAide Management
              </p>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'bg-accent text-accent-contrast'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-dark-text-primary dark:hover:bg-dark-bg-tertiary'
                      }`}
                    >
                      <div className="mr-3 w-5 h-5">
                        {item.icon === 'dashboard' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 9 9-9 9-7-7zm3 5l4 4M3 12l6.5 6.5M21 12l-2.5-2.5m-10 7.5l4-4m6.5 6.5l-4-4" />
                          </svg>
                        )}
                        {item.icon === 'tenants' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                        {item.icon === 'users' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                        {item.icon === 'billing' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        )}
                        {item.icon === 'support' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        )}
                        {item.icon === 'logs' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {item.icon === 'settings' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        {item.icon === 'folder-templates' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        )}
                      </div>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-dark-bg-primary shadow-sm border-b border-gray-200 dark:border-dark-border md:hidden">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 dark:text-dark-text-secondary"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                  Admin Panel
                </h1>
                <div className="flex items-center space-x-4">
                  {/* Notifications bell icon */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setUserMenuOpen(false);
                      }}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none dark:text-dark-text-secondary dark:hover:text-dark-text-primary relative"
                      aria-label="Notifications"
                      title="Notifications"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    <AdminNotifications 
                      isOpen={notificationsOpen}
                      onClose={() => setNotificationsOpen(false)}
                      unreadCount={unreadCount}
                      onMarkAsRead={() => setUnreadCount(prev => Math.max(0, prev - 1))}
                    />
                  </div>
                  
                  {/* User profile */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setUserMenuOpen(!userMenuOpen);
                        setNotificationsOpen(false);
                      }}
                      className="flex items-center focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-contrast font-semibold overflow-hidden">
                        <span className="text-xs">A</span>
                      </div>
                      <span className="ml-2 hidden md:block text-gray-700 dark:text-dark-text-primary">
                        Admin
                      </span>
                      <svg className="ml-1 h-4 w-4 text-gray-500 hidden md:block dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User dropdown menu */}
                    {userMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-bg-secondary dark:ring-dark-border">
                        <div className="py-1">
                          <button 
                            onClick={() => {
                              setUserMenuOpen(false);
                              // navigate('/admin/profile');
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-accent-light dark:text-dark-text-primary dark:hover:bg-accent-dark"
                          >
                            Profile
                          </button>
                          <button 
                            onClick={() => {
                              setUserMenuOpen(false);
                              // navigate('/admin/settings');
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-accent-light dark:text-dark-text-primary dark:hover:bg-accent-dark"
                          >
                            Settings
                          </button>
                          <button 
                            onClick={() => {
                              setUserMenuOpen(false);
                              // logout functionality
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-accent-light dark:text-dark-text-primary dark:hover:bg-accent-dark"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Desktop header */}
          <header className="bg-white dark:bg-dark-bg-primary shadow-sm border-b border-gray-200 dark:border-dark-border hidden md:flex">
            <div className="px-4 sm:px-6 lg:px-8 flex-1">
              <div className="flex items-center justify-between h-16">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                  Master Admin Panel
                </h1>
                <div className="flex items-center space-x-4">
                  {/* Notifications bell icon */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setUserMenuOpen(false);
                      }}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none dark:text-dark-text-secondary dark:hover:text-dark-text-primary relative"
                      aria-label="Notifications"
                      title="Notifications"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    <AdminNotifications 
                      isOpen={notificationsOpen}
                      onClose={() => setNotificationsOpen(false)}
                      unreadCount={unreadCount}
                      onMarkAsRead={() => setUnreadCount(prev => Math.max(0, prev - 1))}
                    />
                  </div>
                  
                  {/* User profile */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setUserMenuOpen(!userMenuOpen);
                        setNotificationsOpen(false);
                      }}
                      className="flex items-center focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-contrast font-semibold overflow-hidden">
                        <span className="text-xs">A</span>
                      </div>
                      <span className="ml-2 text-gray-700 dark:text-dark-text-primary">
                        Admin
                      </span>
                      <svg className="ml-1 h-4 w-4 text-gray-500 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User dropdown menu */}
                    {userMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-bg-secondary dark:ring-dark-border">
                        <div className="py-1">
                          <button 
                            onClick={() => {
                              setUserMenuOpen(false);
                              // navigate('/admin/profile');
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-accent-light dark:text-dark-text-primary dark:hover:bg-accent-dark"
                          >
                            Profile
                          </button>
                          <button 
                            onClick={() => {
                              setUserMenuOpen(false);
                              // navigate('/admin/settings');
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-accent-light dark:text-dark-text-primary dark:hover:bg-accent-dark"
                          >
                            Settings
                          </button>
                          <button 
                            onClick={() => {
                              setUserMenuOpen(false);
                              // logout functionality
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-accent-light dark:text-dark-text-primary dark:hover:bg-accent-dark"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;