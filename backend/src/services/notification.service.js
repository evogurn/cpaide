import prisma from '../config/db.js';
import { logger } from '../config/logger.js';
import { NOTIFICATION_TYPES, NOTIFICATION_STATUS } from '../constants/index.js';

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification({
    userId,
    tenantId,
    type,
    title,
    message,
    data = {},
    priority = 'MEDIUM',
    isUrgent = false
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          tenantId,
          type,
          title,
          message,
          data: data || {},
          priority,
          isUrgent,
          status: NOTIFICATION_STATUS.UNREAD
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      logger.info('Notification created successfully', { notificationId: notification.id, userId, type });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', { error: error.message, userId, type });
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, {
    page = 1,
    limit = 10,
    status = null,
    type = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }) {
    try {
      const whereClause = { userId };

      if (status) {
        whereClause.status = status;
      }

      if (type) {
        whereClause.type = type;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: whereClause,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }),
        prisma.notification.count({ where: whereClause })
      ]);

      return {
        notifications,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Failed to get user notifications', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get notifications for a tenant (admin view)
   */
  async getTenantNotifications(tenantId, {
    page = 1,
    limit = 10,
    status = null,
    type = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }) {
    try {
      const whereClause = { tenantId };

      if (status) {
        whereClause.status = status;
      }

      if (type) {
        whereClause.type = type;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: whereClause,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }),
        prisma.notification.count({ where: whereClause })
      ]);

      return {
        notifications,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Failed to get tenant notifications', { error: error.message, tenantId });
      throw error;
    }
  }

  /**
   * Get all system notifications for master admin
   */
  async getSystemNotifications({
    page = 1,
    limit = 10,
    status = null,
    type = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }) {
    try {
      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      if (type) {
        whereClause.type = type;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: whereClause,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            tenant: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }),
        prisma.notification.count({ where: whereClause })
      ]);

      return {
        notifications,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Failed to get system notifications', { error: error.message });
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          status: NOTIFICATION_STATUS.READ,
          readAt: new Date()
        }
      });

      logger.info('Notification marked as read', { notificationId, userId });

      return notification;
    } catch (error) {
      logger.error('Failed to mark notification as read', { error: error.message, notificationId, userId });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          status: NOTIFICATION_STATUS.UNREAD
        },
        data: {
          status: NOTIFICATION_STATUS.READ,
          readAt: new Date()
        }
      });

      logger.info('All notifications marked as read', { userId, count: result.count });

      return { count: result.count };
    } catch (error) {
      logger.error('Failed to mark all notifications as read', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Archive notification
   */
  async archiveNotification(notificationId, userId) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          status: NOTIFICATION_STATUS.ARCHIVED
        }
      });

      logger.info('Notification archived', { notificationId, userId });

      return notification;
    } catch (error) {
      logger.error('Failed to archive notification', { error: error.message, notificationId, userId });
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await prisma.notification.delete({
        where: {
          id: notificationId,
          userId: userId
        }
      });

      logger.info('Notification deleted', { notificationId, userId });

      return notification;
    } catch (error) {
      logger.error('Failed to delete notification', { error: error.message, notificationId, userId });
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          status: NOTIFICATION_STATUS.UNREAD
        }
      });

      return count;
    } catch (error) {
      logger.error('Failed to get unread notifications count', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get urgent notifications count
   */
  async getUrgentCount(userId) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isUrgent: true,
          status: NOTIFICATION_STATUS.UNREAD
        }
      });

      return count;
    } catch (error) {
      logger.error('Failed to get urgent notifications count', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Send tenant registration notification to master admin
   */
  async sendTenantRegistrationNotification(tenant) {
    try {
      // Get master admin email from environment or database
      const adminEmail = process.env.MASTER_ADMIN_EMAIL || 'admin@cpaide.com';
      
      // Create notification for system admins
      const notification = await this.createNotification({
        userId: null, // System notification
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.TENANT_REGISTRATION,
        title: 'New Tenant Registration',
        message: `New tenant "${tenant.name}" has registered and requires approval`,
        data: {
          tenantId: tenant.id,
          tenantName: tenant.name,
          adminEmail: tenant.adminEmail,
          registrationDate: new Date().toISOString()
        },
        priority: 'HIGH',
        isUrgent: true
      });

      logger.info('Tenant registration notification created', { tenantId: tenant.id });

      return notification;
    } catch (error) {
      logger.error('Failed to send tenant registration notification', { error: error.message, tenantId: tenant.id });
      throw error;
    }
  }

  /**
   * Send tenant approval notification to tenant admin
   */
  async sendTenantApprovalNotification(tenant, adminUser) {
    try {
      // Find the tenant admin user
      const tenantAdmin = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          userRoles: {
            some: {
              role: {
                name: 'TENANT_ADMIN'
              }
            }
          }
        }
      });

      if (!tenantAdmin) {
        throw new Error(`Tenant admin not found for tenant ${tenant.id}`);
      }

      // Create notification for tenant admin
      const notification = await this.createNotification({
        userId: tenantAdmin.id,
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.TENANT_APPROVED,
        title: 'Account Approved',
        message: `Your account "${tenant.name}" has been approved by ${adminUser.firstName} ${adminUser.lastName}`,
        data: {
          tenantId: tenant.id,
          tenantName: tenant.name,
          approvedBy: `${adminUser.firstName} ${adminUser.lastName}`,
          approvedAt: new Date().toISOString()
        },
        priority: 'HIGH'
      });

      logger.info('Tenant approval notification created', { tenantId: tenant.id, userId: tenantAdmin.id });

      return notification;
    } catch (error) {
      logger.error('Failed to send tenant approval notification', { error: error.message, tenantId: tenant.id });
      throw error;
    }
  }

  /**
   * Send tenant rejection notification to tenant admin
   */
  async sendTenantRejectionNotification(tenant, adminUser, reason = 'Administrative review') {
    try {
      // Find the tenant admin user
      const tenantAdmin = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          userRoles: {
            some: {
              role: {
                name: 'TENANT_ADMIN'
              }
            }
          }
        }
      });

      if (!tenantAdmin) {
        throw new Error(`Tenant admin not found for tenant ${tenant.id}`);
      }

      // Create notification for tenant admin
      const notification = await this.createNotification({
        userId: tenantAdmin.id,
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.TENANT_REJECTED,
        title: 'Account Registration Rejected',
        message: `Your account registration for "${tenant.name}" has been rejected`,
        data: {
          tenantId: tenant.id,
          tenantName: tenant.name,
          rejectedBy: `${adminUser.firstName} ${adminUser.lastName}`,
          rejectionReason: reason,
          rejectedAt: new Date().toISOString()
        },
        priority: 'MEDIUM'
      });

      logger.info('Tenant rejection notification created', { tenantId: tenant.id, userId: tenantAdmin.id });

      return notification;
    } catch (error) {
      logger.error('Failed to send tenant rejection notification', { error: error.message, tenantId: tenant.id });
      throw error;
    }
  }

  /**
   * Send support ticket notification
   */
  async sendSupportTicketNotification(ticket, recipientUserId, type = 'SUPPORT_TICKET_CREATED') {
    try {
      let title, message;
      
      switch (type) {
        case 'SUPPORT_TICKET_CREATED':
          title = 'New Support Ticket Created';
          message = `Support ticket "${ticket.title}" has been created`;
          break;
        case 'SUPPORT_TICKET_UPDATED':
          title = 'Support Ticket Updated';
          message = `Support ticket "${ticket.title}" has been updated`;
          break;
        case 'SUPPORT_TICKET_RESOLVED':
          title = 'Support Ticket Resolved';
          message = `Support ticket "${ticket.title}" has been resolved`;
          break;
        default:
          title = 'Support Ticket Notification';
          message = `Support ticket "${ticket.title}" has been updated`;
      }

      const notification = await this.createNotification({
        userId: recipientUserId,
        tenantId: ticket.tenantId,
        type: type,
        title,
        message,
        data: {
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          ticketStatus: ticket.status,
          ticketPriority: ticket.priority
        },
        priority: ticket.priority === 'HIGH' ? 'HIGH' : 'MEDIUM'
      });

      logger.info('Support ticket notification created', { ticketId: ticket.id, userId: recipientUserId });

      return notification;
    } catch (error) {
      logger.error('Failed to send support ticket notification', { error: error.message, ticketId: ticket.id });
      throw error;
    }
  }

  /**
   * Send billing notification
   */
  async sendBillingNotification(tenant, user, type, amount, planName, additionalData = {}) {
    try {
      let title, message;
      
      switch (type) {
        case 'BILLING_PAYMENT_SUCCESS':
          title = 'Payment Received Successfully';
          message = `Payment of $${amount} for ${planName} plan has been processed successfully`;
          break;
        case 'BILLING_PAYMENT_FAILED':
          title = 'Payment Failed - Action Required';
          message = `Payment of $${amount} for ${planName} plan has failed. Please update your payment method.`;
          break;
        case 'BILLING_SUBSCRIPTION_UPDATED':
          title = 'Subscription Plan Updated';
          message = `Your subscription plan has been updated to ${planName}`;
          break;
        default:
          title = 'Billing Notification';
          message = `You have a new billing notification regarding your ${planName} plan`;
      }

      const notification = await this.createNotification({
        userId: user.id,
        tenantId: tenant.id,
        type,
        title,
        message,
        data: {
          amount,
          planName,
          ...additionalData
        },
        priority: type === 'BILLING_PAYMENT_FAILED' ? 'HIGH' : 'MEDIUM'
      });

      logger.info('Billing notification created', { userId: user.id, tenantId: tenant.id, type });

      return notification;
    } catch (error) {
      logger.error('Failed to send billing notification', { error: error.message, userId: user.id, tenantId: tenant.id });
      throw error;
    }
  }

  /**
   * Get notification types enum
   */
  getNotificationTypes() {
    return NOTIFICATION_TYPES;
  }

  /**
   * Get notification status enum
   */
  getNotificationStatus() {
    return NOTIFICATION_STATUS;
  }
}

export default new NotificationService();