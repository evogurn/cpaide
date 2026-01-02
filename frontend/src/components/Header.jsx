import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useTenant';
import AppearancePanel from './AppearancePanel';
import Notifications from './Notifications';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [appearancePanelOpen, setAppearancePanelOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // In a real app, this would come from an API
  const notificationsRef = useRef(null);

  // Fetch user data with React Query
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();

  // Get user data from the API response
  const user = userData || {
    firstName: 'Loading...',
    lastName: '',
    email: '',
    avatar: '/assets/user/dp.png'
  };

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

  // Handle user logout
  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm z-10 dark:bg-dark-bg-secondary dark:shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left section - Hamburger menu (visible only when sidebar is closed) */}
        <div className="flex items-center">
           
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-3 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          
        </div>

        {/* Middle section - Search bar */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
            />
            <div className="absolute left-3 top-2.5 text-gray-400 dark:text-dark-text-secondary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right section - Appearance settings and User profile */}
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
            
            <Notifications 
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              unreadCount={unreadCount}
              onMarkAsRead={() => setUnreadCount(0)}
            />
          </div>
          
          {/* Appearance settings gear icon */}
          <button
            onClick={() => {
              setAppearancePanelOpen(true);
              setNotificationsOpen(false);
            }}
            className="text-gray-500 hover:text-gray-700 focus:outline-none dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
            aria-label="Appearance settings"
            title="Appearance Settings"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {/* User profile */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center focus:outline-none"
            >
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-contrast font-semibold overflow-hidden">
                <img 
                  src={user.avatar || '/assets/user/dp.png'} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="flex items-center justify-center h-full w-full text-accent-contrast font-semibold">${(user.firstName || '').charAt(0)}${(user.lastName || '').charAt(0)}</span>`;
                  }}
                />
              </div>
              <span className="ml-2 hidden md:block text-gray-700 dark:text-dark-text-primary">
                {(isUserLoading) ? 'Loading...' : `${user.firstName} ${user.lastName}`.trim() || user.email || 'User'}
              </span>
              <svg className="ml-1 h-5 w-5 text-gray-500 hidden md:block dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      navigate('/profile');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-accent-light dark:text-dark-text-primary dark:hover:bg-accent-dark"
                  >
                    Profile
                  </button>
                  <button 
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-accent-light dark:text-dark-text-primary dark:hover:bg-accent-dark"
                  >
                    Settings
                  </button>
                  <button 
                    onClick={handleLogout}
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

      {/* Mobile search bar */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
          />
          <div className="absolute left-3 top-2.5 text-gray-400 dark:text-dark-text-secondary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Appearance Panel */}
      <AppearancePanel 
        isOpen={appearancePanelOpen} 
        onClose={() => setAppearancePanelOpen(false)} 
      />
    </header>
  );
};

export default Header;