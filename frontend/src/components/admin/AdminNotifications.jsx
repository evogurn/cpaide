import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../services/notificationService";

const AdminNotifications = ({ isOpen, onClose, unreadCount, onMarkAsRead }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Fetch notifications from backend
  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        setLoading(true);
        try {
          const response = await notificationService.getSystemNotifications({
            page: 1,
            limit: 10,
            sortBy: "createdAt",
            sortOrder: "desc",
          });

          // Format notifications for display
          const formattedNotifications = response.data.notifications.map(
            (notification) => ({
              id: notification.id,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              timestamp: notification.createdAt,
              relativeTime: formatRelativeTime(notification.createdAt),
              status: notification.status,
              priority: notification.priority,
              isUrgent: notification.isUrgent,
            })
          );

          setNotifications(formattedNotifications);
        } catch (error) {
          console.error("Failed to fetch system notifications:", error);
          // Don't propagate the error that could cause logout
          // Specifically handle 403/401 errors that could trigger logout
          if (error.response?.status === 401 || error.response?.status === 403) {
            // User might not have proper permissions, but don't logout
            setNotifications([]);
          } else {
            setNotifications([]);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    onClose();

    // Mark notification as read (in background)
    const markAsReadAsync = async () => {
      try {
        await notificationService.markAsRead(notification.id);
        // Update the notification status locally
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, status: "READ" } : n
          )
        );

        // Update unread count in parent
        if (onMarkAsRead) {
          onMarkAsRead();
        }
      } catch (error) {
        // Don't log error to console to prevent disruption
        // Just silently handle the error since the navigation is more important
      }
    };
    
    // Start the marking process in the background
    markAsReadAsync();

    // Navigate to appropriate page based on notification type
    if (notification.type === "TENANT_REGISTRATION" || 
        notification.type === "TENANT_ORGANIZATION_NAME_CHANGED" ||
        notification.type === "TENANT_BILLING_PLAN_UPDATED" ||
        notification.type === "TENANT_BILLING_EXPIRED") {
      navigate("/cpaide/admin/tenants");
    } else if (
      notification.type === "TENANT_APPROVED" ||
      notification.type === "TENANT_REJECTED"
    ) {
      navigate("/cpaide/admin/tenants");
    } else if (
      notification.type === "SUPPORT_TICKET_CREATED" ||
      notification.type === "SUPPORT_TICKET_UPDATED" ||
      notification.type === "SUPPORT_TICKET_RESOLVED"
    ) {
      navigate("/cpaide/admin/support");
    } else {
      navigate("/cpaide/admin/dashboard");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-bg-secondary dark:ring-dark-border z-50">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
          Admin Notifications
        </h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-6 text-center">
            <p className="text-gray-500 dark:text-dark-text-secondary">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-gray-500 dark:text-dark-text-secondary">
              No notifications
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-dark-border">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-dark-bg-primary ${
                  notification.isUrgent ? "bg-red-50 dark:bg-red-900/10" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    {notification.type === "TENANT_REGISTRATION" || 
                     notification.type === "TENANT_ORGANIZATION_NAME_CHANGED" ||
                     notification.type === "TENANT_LOGIN_UI_UPDATE" ? (
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900/30">
                        <svg
                          className="h-4 w-4 text-purple-600 dark:text-purple-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    ) : notification.type === "TENANT_BILLING_PLAN_UPDATED" ||
                         notification.type === "TENANT_BILLING_EXPIRED" ? (
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center dark:bg-yellow-900/30">
                        <svg
                          className="h-4 w-4 text-yellow-600 dark:text-yellow-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    ) : notification.type === "TENANT_APPROVED" ||
                      notification.type === "TENANT_REJECTED" ? (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                        <svg
                          className="h-4 w-4 text-green-600 dark:text-green-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    ) : notification.type === "SUPPORT_TICKET_CREATED" ||
                      notification.type === "SUPPORT_TICKET_UPDATED" ||
                      notification.type === "SUPPORT_TICKET_RESOLVED" ? (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                        <svg
                          className="h-4 w-4 text-blue-600 dark:text-blue-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-900/30">
                        <svg
                          className="h-4 w-4 text-gray-600 dark:text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
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
                    {notification.isUrgent && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        URGENT
                      </span>
                    )}
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
            navigate("/cpaide/admin/dashboard");
          }}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default AdminNotifications;
