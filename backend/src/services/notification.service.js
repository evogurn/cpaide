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
   * Get system notifications unread count
   */
  async getSystemUnreadCount() {
    try {
      const count = await prisma.notification.count({
        where: {
          status: NOTIFICATION_STATUS.UNREAD
        }
      });

      return count;
    } catch (error) {
      logger.error('Failed to get system unread notifications count', { error: error.message });
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

      // Also send email notification
      try {
        const emailService = await import('./email.service.js').then(m => m.default);
        
        if (recipientUserId === null) {
          // Send to master admin
          const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL || 'admin@cpaide.com';
          await emailService.sendSupportTicketNotification(ticket, masterAdminEmail, 'new');
        } else {
          // Send to specific user
          const user = await prisma.user.findUnique({ where: { id: recipientUserId } });
          if (user) {
            await emailService.sendSupportTicketNotification(ticket, user.email, 'new');
          }
        }
      } catch (emailError) {
        logger.error('Failed to send support ticket email', { error: emailError.message, ticketId: ticket.id });
      }

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
   * Send tenant organization name change notification to master admin
   */
  async sendTenantOrgNameChangeNotification(tenant, oldName, adminUser) {
    try {
      const notification = await this.createNotification({
        userId: null, // System notification
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.TENANT_ORGANIZATION_NAME_CHANGED,
        title: 'Tenant Organization Name Changed',
        message: `Tenant "${oldName}" has changed their organization name to "${tenant.name}"`,
        data: {
          tenantId: tenant.id,
          oldName,
          newName: tenant.name,
          changedBy: `${adminUser.firstName} ${adminUser.lastName}`,
          changedAt: new Date().toISOString()
        },
        priority: 'MEDIUM'
      });

      // Also send email notification
      try {
        const emailService = await import('./email.service.js').then(m => m.default);
        await emailService.sendTenantOrgNameChangeNotification(tenant, oldName, adminUser);
      } catch (emailError) {
        logger.error('Failed to send tenant org name change email', { error: emailError.message, tenantId: tenant.id });
      }

      logger.info('Tenant organization name change notification created', { tenantId: tenant.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send tenant org name change notification', { error: error.message, tenantId: tenant.id });
      throw error;
    }
  }

  /**
   * Send tenant login/registration UI update notification to master admin
   */
  async sendTenantUIUpdateNotification(tenant, updateType, adminUser) {
    try {
      const notification = await this.createNotification({
        userId: null, // System notification
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.TENANT_LOGIN_UI_UPDATE,
        title: `Tenant ${updateType} Updated`,
        message: `Tenant "${tenant.name}" has updated their ${updateType.toLowerCase()} page`,
        data: {
          tenantId: tenant.id,
          tenantName: tenant.name,
          updateType,
          updatedBy: `${adminUser.firstName} ${adminUser.lastName}`,
          updatedAt: new Date().toISOString()
        },
        priority: 'LOW'
      });

      // Also send email notification
      try {
        const emailService = await import('./email.service.js').then(m => m.default);
        await emailService.sendTenantUIUpdateNotification(tenant, updateType, adminUser);
      } catch (emailError) {
        logger.error('Failed to send tenant UI update email', { error: emailError.message, tenantId: tenant.id });
      }

      logger.info('Tenant UI update notification created', { tenantId: tenant.id, updateType });
      return notification;
    } catch (error) {
      logger.error('Failed to send tenant UI update notification', { error: error.message, tenantId: tenant.id });
      throw error;
    }
  }

  /**
   * Send tenant billing plan update notification to master admin
   */
  async sendTenantBillingPlanUpdateNotification(tenant, oldPlan, newPlan, adminUser) {
    try {
      const notification = await this.createNotification({
        userId: null, // System notification
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.TENANT_BILLING_PLAN_UPDATED,
        title: 'Tenant Billing Plan Updated',
        message: `Tenant "${tenant.name}" has updated their billing plan from "${oldPlan?.name || 'None'}" to "${newPlan.name}"`,
        data: {
          tenantId: tenant.id,
          tenantName: tenant.name,
          oldPlan: oldPlan?.name || 'None',
          newPlan: newPlan.name,
          updatedBy: `${adminUser.firstName} ${adminUser.lastName}`,
          updatedAt: new Date().toISOString()
        },
        priority: 'MEDIUM'
      });

      // Also send email notification
      try {
        const emailService = await import('./email.service.js').then(m => m.default);
        await emailService.sendTenantBillingPlanUpdateNotification(tenant, oldPlan, newPlan, adminUser);
      } catch (emailError) {
        logger.error('Failed to send tenant billing plan update email', { error: emailError.message, tenantId: tenant.id });
      }

      logger.info('Tenant billing plan update notification created', { tenantId: tenant.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send tenant billing plan update notification', { error: error.message, tenantId: tenant.id });
      throw error;
    }
  }

  /**
   * Send tenant billing expired notification to master admin
   */
  async sendTenantBillingExpiredNotification(tenant) {
    try {
      const notification = await this.createNotification({
        userId: null, // System notification
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.TENANT_BILLING_EXPIRED,
        title: 'Tenant Billing Expired',
        message: `Tenant "${tenant.name}" billing has expired and requires attention`,
        data: {
          tenantId: tenant.id,
          tenantName: tenant.name,
          expiredAt: new Date().toISOString()
        },
        priority: 'HIGH',
        isUrgent: true
      });

      // Also send email notification
      try {
        const emailService = await import('./email.service.js').then(m => m.default);
        await emailService.sendTenantBillingExpiredNotification(tenant);
      } catch (emailError) {
        logger.error('Failed to send tenant billing expired email', { error: emailError.message, tenantId: tenant.id });
      }

      logger.info('Tenant billing expired notification created', { tenantId: tenant.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send tenant billing expired notification', { error: error.message, tenantId: tenant.id });
      throw error;
    }
  }

  /**
   * Send staff folder creation notification to tenant admin
   */
  async sendStaffFolderCreatedNotification(folder, user, tenant) {
    try {
      // Find tenant admin
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

      const notification = await this.createNotification({
        userId: tenantAdmin.id,
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.STAFF_FOLDER_CREATED,
        title: 'New Folder Created',
        message: `Staff member ${user.firstName} ${user.lastName} created folder "${folder.name}"`,
        data: {
          folderId: folder.id,
          folderName: folder.name,
          createdBy: `${user.firstName} ${user.lastName}`,
          creatorId: user.id,
          createdAt: new Date().toISOString()
        },
        priority: 'LOW'
      });

      // Also send email notification
      try {
        const emailService = await import('./email.service.js').then(m => m.default);
        await emailService.sendStaffFolderCreatedNotification(folder, user, tenantAdmin);
      } catch (emailError) {
        logger.error('Failed to send staff folder created email', { error: emailError.message, folderId: folder.id });
      }

      logger.info('Staff folder created notification sent', { folderId: folder.id, userId: tenantAdmin.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send staff folder created notification', { error: error.message, folderId: folder.id });
      throw error;
    }
  }

  /**
   * Send staff folder deletion notification to tenant admin
   */
  async sendStaffFolderDeletedNotification(folderName, user, tenant) {
    try {
      // Find tenant admin
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

      const notification = await this.createNotification({
        userId: tenantAdmin.id,
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.STAFF_FOLDER_DELETED,
        title: 'Folder Deleted',
        message: `Staff member ${user.firstName} ${user.lastName} deleted folder "${folderName}"`,
        data: {
          folderName,
          deletedBy: `${user.firstName} ${user.lastName}`,
          deleterId: user.id,
          deletedAt: new Date().toISOString()
        },
        priority: 'MEDIUM'
      });

      // Also send email notification
      try {
        const emailService = await import('./email.service.js').then(m => m.default);
        await emailService.sendStaffFolderDeletedNotification(folderName, user, tenantAdmin);
      } catch (emailError) {
        logger.error('Failed to send staff folder deleted email', { error: emailError.message, folderName });
      }

      logger.info('Staff folder deleted notification sent', { folderName, userId: tenantAdmin.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send staff folder deleted notification', { error: error.message, folderName });
      throw error;
    }
  }

  /**
   * Send staff document upload notification to tenant admin
   */
  async sendStaffDocumentUploadedNotification(document, user, tenant) {
    try {
      // Find tenant admin
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

      const notification = await this.createNotification({
        userId: tenantAdmin.id,
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.STAFF_DOCUMENT_UPLOADED,
        title: 'New Document Uploaded',
        message: `Staff member ${user.firstName} ${user.lastName} uploaded document "${document.name}"`,
        data: {
          documentId: document.id,
          documentName: document.name,
          uploadedBy: `${user.firstName} ${user.lastName}`,
          uploaderId: user.id,
          uploadedAt: new Date().toISOString(),
          fileSize: document.size
        },
        priority: 'LOW'
      });

      // Also send email notification
      try {
        const emailService = await import('./email.service.js').then(m => m.default);
        await emailService.sendStaffDocumentUploadedNotification(document, user, tenantAdmin);
      } catch (emailError) {
        logger.error('Failed to send staff document uploaded email', { error: emailError.message, documentId: document.id });
      }

      logger.info('Staff document uploaded notification sent', { documentId: document.id, userId: tenantAdmin.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send staff document uploaded notification', { error: error.message, documentId: document.id });
      throw error;
    }
  }

  /**
   * Send staff document deletion notification to tenant admin
   */
  async sendStaffDocumentDeletedNotification(documentName, user, tenant) {
    try {
      // Find tenant admin
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

      const notification = await this.createNotification({
        userId: tenantAdmin.id,
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.STAFF_DOCUMENT_DELETED,
        title: 'Document Deleted',
        message: `Staff member ${user.firstName} ${user.lastName} deleted document "${documentName}"`,
        data: {
          documentName,
          deletedBy: `${user.firstName} ${user.lastName}`,
          deleterId: user.id,
          deletedAt: new Date().toISOString()
        },
        priority: 'MEDIUM'
      });

      // Also send email notification
      try {
        const emailService = await import('./email.service.js').then(m => m.default);
        await emailService.sendStaffDocumentDeletedNotification(documentName, user, tenantAdmin);
      } catch (emailError) {
        logger.error('Failed to send staff document deleted email', { error: emailError.message, documentName });
      }

      logger.info('Staff document deleted notification sent', { documentName, userId: tenantAdmin.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send staff document deleted notification', { error: error.message, documentName });
      throw error;
    }
  }

  /**
   * Send staff document moved notification to tenant admin
   */
  async sendStaffDocumentMovedNotification(document, user, tenant, oldFolderName, newFolderName) {
    try {
      // Find tenant admin
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

      const notification = await this.createNotification({
        userId: tenantAdmin.id,
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.STAFF_DOCUMENT_MOVED,
        title: 'Document Moved',
        message: `Staff member ${user.firstName} ${user.lastName} moved document "${document.name}" from "${oldFolderName}" to "${newFolderName}"`,
        data: {
          documentId: document.id,
          documentName: document.name,
          movedBy: `${user.firstName} ${user.lastName}`,
          moverId: user.id,
          movedAt: new Date().toISOString(),
          oldFolder: oldFolderName,
          newFolder: newFolderName
        },
        priority: 'LOW'
      });

      logger.info('Staff document moved notification sent', { documentId: document.id, userId: tenantAdmin.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send staff document moved notification', { error: error.message, documentId: document.id });
      throw error;
    }
  }

  /**
   * Send staff folder moved notification to tenant admin
   */
  async sendStaffFolderMovedNotification(folder, user, tenant, oldParentName, newParentName) {
    try {
      // Find tenant admin
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

      const notification = await this.createNotification({
        userId: tenantAdmin.id,
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.STAFF_FOLDER_MOVED,
        title: 'Folder Moved',
        message: `Staff member ${user.firstName} ${user.lastName} moved folder "${folder.name}" from "${oldParentName}" to "${newParentName}"`,
        data: {
          folderId: folder.id,
          folderName: folder.name,
          movedBy: `${user.firstName} ${user.lastName}`,
          moverId: user.id,
          movedAt: new Date().toISOString(),
          oldParent: oldParentName,
          newParent: newParentName
        },
        priority: 'LOW'
      });

      logger.info('Staff folder moved notification sent', { folderId: folder.id, userId: tenantAdmin.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send staff folder moved notification', { error: error.message, folderId: folder.id });
      throw error;
    }
  }

  /**
   * Send staff document renamed notification to tenant admin
   */
  async sendStaffDocumentRenamedNotification(document, user, tenant, oldName) {
    try {
      // Find tenant admin
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

      const notification = await this.createNotification({
        userId: tenantAdmin.id,
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.STAFF_DOCUMENT_RENAMED,
        title: 'Document Renamed',
        message: `Staff member ${user.firstName} ${user.lastName} renamed document from "${oldName}" to "${document.name}"`,
        data: {
          documentId: document.id,
          oldName,
          newName: document.name,
          renamedBy: `${user.firstName} ${user.lastName}`,
          renamerId: user.id,
          renamedAt: new Date().toISOString()
        },
        priority: 'LOW'
      });

      logger.info('Staff document renamed notification sent', { documentId: document.id, userId: tenantAdmin.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send staff document renamed notification', { error: error.message, documentId: document.id });
      throw error;
    }
  }

  /**
   * Send staff folder renamed notification to tenant admin
   */
  async sendStaffFolderRenamedNotification(folder, user, tenant, oldName) {
    try {
      // Find tenant admin
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

      const notification = await this.createNotification({
        userId: tenantAdmin.id,
        tenantId: tenant.id,
        type: NOTIFICATION_TYPES.STAFF_FOLDER_RENAMED,
        title: 'Folder Renamed',
        message: `Staff member ${user.firstName} ${user.lastName} renamed folder from "${oldName}" to "${folder.name}"`,
        data: {
          folderId: folder.id,
          oldName,
          newName: folder.name,
          renamedBy: `${user.firstName} ${user.lastName}`,
          renamerId: user.id,
          renamedAt: new Date().toISOString()
        },
        priority: 'LOW'
      });

      logger.info('Staff folder renamed notification sent', { folderId: folder.id, userId: tenantAdmin.id });
      return notification;
    } catch (error) {
      logger.error('Failed to send staff folder renamed notification', { error: error.message, folderId: folder.id });
      throw error;
    }
  }

  /**
   * Get notification status enum
   */
  getNotificationStatus() {
    return NOTIFICATION_STATUS;
  }
}

export default new NotificationService();