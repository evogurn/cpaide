import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentHistory, loginHistory } from '../data/index';

const Notifications = ({ isOpen, onClose, unreadCount, onMarkAsRead }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Combine and format notifications from both data sources
  useEffect(() => {
    if (isOpen) {
      // Process document history
      const documentNotifications = documentHistory.slice(0, 5).map(item => ({
        id: `doc-${item.id}`,
        type: 'document',
        title: `${item.performedBy} ${item.action} ${item.documentName}`,
        timestamp: item.timestamp,
        relativeTime: formatRelativeTime(item.timestamp),
        relatedId: item.documentName
      }));

      // Process login history
      const loginNotifications = loginHistory.slice(0, 5).map(item => ({
        id: `login-${item.id}`,
        type: 'login',
        title: `${item.username} logged in`,
        timestamp: item.loginTime,
        relativeTime: formatRelativeTime(item.loginTime)
      }));

      // Combine and sort by timestamp (newest first)
      const combined = [...documentNotifications, ...loginNotifications]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10); // Limit to 10 newest notifications

      setNotifications(combined);
    }
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    onClose();
    onMarkAsRead();
    
    // Navigate to appropriate page based on notification type
    if (notification.type === 'document') {
      navigate('/history');
    } else if (notification.type === 'login') {
      navigate('/history?tab=login');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-bg-secondary dark:ring-dark-border z-50">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-gray-500 dark:text-dark-text-secondary">No notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-dark-border">
            {notifications.map((notification) => (
              <li 
                key={notification.id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-dark-bg-primary"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    {notification.type === 'document' ? (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                        <svg className="h-4 w-4 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                        <svg className="h-4 w-4 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                      {notification.relativeTime}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-border text-center">
        <button 
          className="text-sm font-medium text-accent hover:text-accent-dark dark:text-accent dark:hover:text-accent-light"
          onClick={() => {
            onClose();
            navigate('/history');
          }}
        >
          View all history
        </button>
      </div>
    </div>
  );
};

export default Notifications;