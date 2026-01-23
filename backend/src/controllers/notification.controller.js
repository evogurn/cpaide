import notificationService from '../services/notification.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get user notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const notifications = await notificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      type,
      sortBy,
      sortOrder
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(notifications, 'Notifications retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await notificationService.getUnreadCount(userId);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ count }, 'Unread notifications count retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.markAsRead(id, userId);

    return res.status(HTTP_STATUS.OK).json(
      successResponse(notification, 'Notification marked as read successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await notificationService.markAllAsRead(userId);

    return res.status(HTTP_STATUS.OK).json(
      successResponse(result, 'All notifications marked as read successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Archive notification
 */
export const archiveNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.archiveNotification(id, userId);

    return res.status(HTTP_STATUS.OK).json(
      successResponse(notification, 'Notification archived successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.deleteNotification(id, userId);

    return res.status(HTTP_STATUS.OK).json(
      successResponse(notification, 'Notification deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get system notifications unread count for master admin
 */
export const getSystemUnreadCount = async (req, res, next) => {
  try {
    // Check if user has SUPER_ADMIN role
    const userRoles = req.user.userRoles.map(ur => ur.role.name);
    const hasSuperAdminRole = userRoles.includes('SUPER_ADMIN');
    
    if (!hasSuperAdminRole) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Insufficient permissions', ERROR_CODES.INSUFFICIENT_PERMISSIONS, null, HTTP_STATUS.FORBIDDEN)
      );
    }
    
    const count = await notificationService.getSystemUnreadCount();

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ count }, 'System unread notifications count retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get system notifications for master admin
 */
export const getSystemNotifications = async (req, res, next) => {
  try {
    // Check if user has SUPER_ADMIN role
    const userRoles = req.user.userRoles.map(ur => ur.role.name);
    const hasSuperAdminRole = userRoles.includes('SUPER_ADMIN');
    
    if (!hasSuperAdminRole) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse('Insufficient permissions', ERROR_CODES.INSUFFICIENT_PERMISSIONS, null, HTTP_STATUS.FORBIDDEN)
      );
    }
    
    const {
      page = 1,
      limit = 10,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const notifications = await notificationService.getSystemNotifications({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      type,
      sortBy,
      sortOrder
    });

    return res.status(HTTP_STATUS.OK).json(
      successResponse(notifications, 'System notifications retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};