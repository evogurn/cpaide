import prisma from '../config/db.js';
import notificationService from './notification.service.js';
import emailService from './email.service.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';

class SupportTicketService {
  /**
   * Create a new support ticket
   */
  async createTicket({ title, description, priority, userId, tenantId }) {
    const ticket = await prisma.supportTicket.create({
      data: {
        title,
        description,
        priority,
        createdBy: userId,
        tenantId,
      },
      include: {
        tenant: true,
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Send notification to master admin about new ticket
    try {
      // Create notification for master admin
      await notificationService.createNotification({
        type: NOTIFICATION_TYPES.SUPPORT_TICKET_CREATED,
        title: 'New Support Ticket Created',
        message: `A new support ticket "${ticket.title}" has been created by ${ticket.createdByUser.firstName} ${ticket.createdByUser.lastName}`,
        tenantId: ticket.tenantId,
        data: {
          ticketId: ticket.id,
          tenantName: ticket.tenant.name,
          createdBy: ticket.createdByUser.firstName + ' ' + ticket.createdByUser.lastName,
        },
        isUrgent: priority === 'URGENT',
      });

      // Send email notification to master admin
      const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL || 'admin@cpaide.com';
      await emailService.sendSupportTicketNotification(
        { id: ticket.id, title: ticket.title, description: ticket.description },
        masterAdminEmail,
        'new'
      );
    } catch (notificationError) {
      console.error('Failed to send support ticket notification:', notificationError);
      // Don't fail the ticket creation if notification fails
    }

    return ticket;
  }

  /**
   * Get tickets for a tenant (tenant view)
   */
  async getTenantTickets(tenantId, userId, { page = 1, limit = 10, status, priority } = {}) {
    const whereClause = {
      tenantId,
      deletedAt: null,
    };

    if (status) {
      whereClause.status = status;
    }
    if (priority) {
      whereClause.priority = priority;
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where: whereClause,
        include: {
          createdByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          assignedToUser: {
            select: {
              firstName: true,
              lastName: true,
            }
          },
          comments: {
            include: {
              createdByUser: {
                select: {
                  firstName: true,
                  lastName: true,
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supportTicket.count({ where: whereClause })
    ]);

    return {
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get all tickets for admin (admin view)
   */
  async getAllTickets({ page = 1, limit = 10, status, priority, tenantId, search } = {}) {
    const whereClause = {
      deletedAt: null,
    };

    if (status) {
      whereClause.status = status;
    }
    if (priority) {
      whereClause.priority = priority;
    }
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where: whereClause,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
            }
          },
          createdByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          assignedToUser: {
            select: {
              firstName: true,
              lastName: true,
            }
          },
          comments: {
            include: {
              createdByUser: {
                select: {
                  firstName: true,
                  lastName: true,
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supportTicket.count({ where: whereClause })
    ]);

    return {
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId, userId, userRole) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          }
        },
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        assignedToUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        resolvedByUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        comments: {
          include: {
            createdByUser: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Check if user has permission to view this ticket
    // For tenants: can only view tickets from their tenant
    // For admins: can view any ticket
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'TENANT_ADMIN') {
      // Additional role checks would go here
    }

    return ticket;
  }

  /**
   * Update ticket status (admin only)
   */
  async updateTicket(ticketId, updateData, adminUserId) {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Send notification to tenant user about ticket update
    try {
      let notificationType = NOTIFICATION_TYPES.SUPPORT_TICKET_UPDATED;
      let notificationTitle = 'Support Ticket Updated';
      let notificationMessage = `Your support ticket "${ticket.title}" has been updated.`;

      if (updateData.status === 'RESOLVED') {
        notificationType = NOTIFICATION_TYPES.SUPPORT_TICKET_RESOLVED;
        notificationTitle = 'Support Ticket Resolved';
        notificationMessage = `Your support ticket "${ticket.title}" has been resolved.`;
      }

      // Create notification for tenant user
      await notificationService.createNotification({
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        userId: ticket.createdBy,
        tenantId: ticket.tenantId,
        data: {
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          status: ticket.status,
        },
        isUrgent: ticket.priority === 'URGENT',
      });

      // Send email notification to tenant user
      await emailService.sendSupportTicketResolutionNotification(
        { 
          id: ticket.id, 
          title: ticket.title, 
          description: ticket.description,
          resolutionNotes: ticket.resolutionNotes || 'No resolution notes provided'
        },
        ticket.createdByUser.email
      );
    } catch (notificationError) {
      console.error('Failed to send ticket update notification:', notificationError);
      // Don't fail the ticket update if notification fails
    }

    return ticket;
  }

  /**
   * Add comment to ticket
   */
  async addComment(ticketId, comment, userId, userRole) {
    const ticketComment = await prisma.supportTicketComment.create({
      data: {
        ticketId,
        comment,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Update ticket status to IN_PROGRESS when first comment is added by admin
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (userRole === 'SUPER_ADMIN' && ticket.status === 'OPEN') {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    // Send notification to relevant parties about the comment
    try {
      const updatedTicket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
            }
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      // Create notification for ticket creator
      await notificationService.createNotification({
        type: NOTIFICATION_TYPES.SUPPORT_TICKET_UPDATED,
        title: 'New Comment on Support Ticket',
        message: `A new comment has been added to your support ticket "${updatedTicket.title}"`,
        userId: updatedTicket.createdBy,
        tenantId: updatedTicket.tenantId,
        data: {
          ticketId: updatedTicket.id,
          ticketTitle: updatedTicket.title,
          comment: comment,
          commenter: ticketComment.createdByUser.firstName + ' ' + ticketComment.createdByUser.lastName,
        },
        isUrgent: updatedTicket.priority === 'URGENT',
      });

      // Send email notification to ticket creator
      await emailService.sendSupportTicketNotification(
        { 
          id: updatedTicket.id, 
          title: updatedTicket.title, 
          description: updatedTicket.description,
        },
        updatedTicket.createdByUser.email,
        'updated'
      );
    } catch (notificationError) {
      console.error('Failed to send comment notification:', notificationError);
      // Don't fail the comment creation if notification fails
    }

    return ticketComment;
  }

  /**
   * Get comments for a ticket
   */
  async getTicketComments(ticketId) {
    return await prisma.supportTicketComment.findMany({
      where: { ticketId },
      include: {
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Resolve ticket
   */
  async resolveTicket(ticketId, resolutionNotes, adminUserId) {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'RESOLVED',
        resolvedBy: adminUserId,
        resolvedAt: new Date(),
        resolutionNotes,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Send notification to tenant user about ticket resolution
    try {
      // Create notification for tenant user
      await notificationService.createNotification({
        type: NOTIFICATION_TYPES.SUPPORT_TICKET_RESOLVED,
        title: 'Support Ticket Resolved',
        message: `Your support ticket "${ticket.title}" has been resolved.`,
        userId: ticket.createdBy,
        tenantId: ticket.tenantId,
        data: {
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          resolutionNotes: resolutionNotes,
        },
        isUrgent: ticket.priority === 'URGENT',
      });

      // Send email notification to tenant user
      await emailService.sendSupportTicketResolutionNotification(
        { 
          id: ticket.id, 
          title: ticket.title, 
          description: ticket.description,
          resolutionNotes: resolutionNotes || 'No resolution notes provided'
        },
        ticket.createdByUser.email
      );
    } catch (notificationError) {
      console.error('Failed to send ticket resolution notification:', notificationError);
      // Don't fail the ticket resolution if notification fails
    }

    return ticket;
  }
}

export default new SupportTicketService();