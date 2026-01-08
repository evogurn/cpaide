import express from 'express';
import { 
  createTicket,
  getTenantTickets,
  getAllTickets,
  getTicketById,
  updateTicket,
  addComment,
  getTicketComments,
  resolveTicket
} from '../controllers/supportTicket.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/rbac.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Tenant routes - only authenticated users can access
router.use(authenticate);

// Create ticket (any authenticated user can create)
router.post('/', createTicket);

// Get tenant's tickets
router.get('/', getTenantTickets);

// Get specific ticket
router.get('/:ticketId', getTicketById);

// Add comment to ticket
router.post('/:ticketId/comments', addComment);

// Get comments for a ticket
router.get('/:ticketId/comments', getTicketComments);

// Admin routes - require admin access
router.use('/admin', requireRole([ROLES.SUPER_ADMIN, ROLES.TENANT_ADMIN]));

// Admin: Get all tickets
router.get('/admin/tickets', getAllTickets);

// Admin: Update ticket
router.patch('/admin/tickets/:ticketId', updateTicket);

// Admin: Resolve ticket
router.post('/admin/tickets/:ticketId/resolve', resolveTicket);

export default router;