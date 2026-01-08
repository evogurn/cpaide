import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getNotifications, markAsRead, markAllAsRead, archiveNotification, deleteNotification, getUnreadCount } from '../controllers/notification.controller.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticate, getNotifications);

// Get unread count
router.get('/unread-count', authenticate, getUnreadCount);

// Mark notification as read
router.patch('/:id/read', authenticate, markAsRead);

// Mark all notifications as read
router.patch('/read-all', authenticate, markAllAsRead);

// Archive notification
router.patch('/:id/archive', authenticate, archiveNotification);

// Delete notification
router.delete('/:id', authenticate, deleteNotification);

export default router;