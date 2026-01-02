import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useTenant';
import { navigation } from '../data/index';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  // Use imported navigation
  const navigationItems = navigation;

  // Fetch user data with React Query (includes tenant info)
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();

  // Get tenant name from user data
  const tenantName = userData?.tenant?.name || 'Organization';

  // Set sidebar to be open by default on mount
  useEffect(() => {
    setSidebarOpen(true);
  }, [setSidebarOpen]);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-dark-bg-primary dark:bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out dark:bg-dark-bg-secondary dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.3)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header with logo and hamburger */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center">
              <div className="bg-accent text-accent-contrast rounded-lg p-2 mr-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text-primary">
                {isUserLoading ? 'Loading...' : tenantName}
              </h1>
            </div>
            {/* Hamburger button to close sidebar - visible on all screens when sidebar is open */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-accent-light text-accent-contrast'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-dark-text-primary dark:hover:bg-dark-bg-primary dark:hover:text-dark-text-primary'
                    }`}
                  >
                    <svg 
                      className={`mr-3 h-6 w-6 ${
                        isActive ? 'text-accent-contrast' : 'text-gray-400 group-hover:text-gray-500 dark:text-dark-text-secondary dark:group-hover:text-dark-text-primary'
                      }`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Sidebar footer */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4 dark:border-dark-border">
            <div className="flex items-center">
              <div className="text-sm">
                <p className="font-medium text-gray-700 dark:text-dark-text-primary">
                  {isUserLoading ? 'Loading...' : `${userData?.firstName} ${userData?.lastName}`.trim() || 'User'}
                </p>
                <p className="text-gray-500 dark:text-dark-text-secondary">
                  {isUserLoading ? 'Loading...' : userData?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;