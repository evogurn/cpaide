import { successResponse } from '../utils/response.js';
import supportTicketService from '../services/supportTicket.service.js';

/**
 * Create a new support ticket (tenant only)
 */
export const createTicket = async (req, res, next) => {
  try {
    const { title, description, priority = 'MEDIUM' } = req.body;
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const ticket = await supportTicketService.createTicket({
      title,
      description,
      priority,
      userId,
      tenantId
    });

    return res.status(201).json(
      successResponse(ticket, 'Support ticket created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get tickets for current tenant
 */
export const getTenantTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    const { page, limit, status, priority } = req.query;

    const result = await supportTicketService.getTenantTickets(
      tenantId, 
      userId, 
      { page, limit, status, priority }
    );

    return res.status(200).json(
      successResponse(result, 'Tickets retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tickets (admin only)
 */
export const getAllTickets = async (req, res, next) => {
  try {
    const { page, limit, status, priority, tenantId, search } = req.query;

    const result = await supportTicketService.getAllTickets({
      page,
      limit,
      status,
      priority,
      tenantId,
      search
    });

    return res.status(200).json(
      successResponse(result, 'Tickets retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get ticket by ID
 */
export const getTicketById = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userRole = req.user.role; // Assuming role is available in req.user
    const userId = req.user.id;

    const ticket = await supportTicketService.getTicketById(ticketId, userId, userRole);

    return res.status(200).json(
      successResponse(ticket, 'Ticket retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update ticket (admin only)
 */
export const updateTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const updateData = req.body;
    const adminUserId = req.user.id;

    const ticket = await supportTicketService.updateTicket(ticketId, updateData, adminUserId);

    return res.status(200).json(
      successResponse(ticket, 'Ticket updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Add comment to ticket
 */
export const addComment = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role; // Assuming role is available in req.user

    const ticketComment = await supportTicketService.addComment(ticketId, comment, userId, userRole);

    return res.status(201).json(
      successResponse(ticketComment, 'Comment added successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments for a ticket
 */
export const getTicketComments = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const comments = await supportTicketService.getTicketComments(ticketId);

    return res.status(200).json(
      successResponse(comments, 'Comments retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve ticket (admin only)
 */
export const resolveTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { resolutionNotes } = req.body;
    const adminUserId = req.user.id;

    const ticket = await supportTicketService.resolveTicket(ticketId, resolutionNotes, adminUserId);

    return res.status(200).json(
      successResponse(ticket, 'Ticket resolved successfully')
    );
  } catch (error) {
    next(error);
  }
};