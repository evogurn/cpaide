import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Close sidebar when route changes (useful for mobile)
  useEffect(() => {
    // Don't close sidebar on desktop when route changes
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location]);

  return (
    <div className="flex flex-col h-screen bg-app dark:bg-dark-bg-primary">
      {/* Header - full width on all screens */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - pushes main content when open */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content - adjust width based on sidebar state */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : ''} dark:bg-dark-bg-primary`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;