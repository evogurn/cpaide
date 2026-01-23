import api from '../utils/api';

export const supportTicketService = {
  // Create a new support ticket
  async createTicket(ticketData) {
    const response = await api.post('/support-tickets', ticketData);
    return response.data;
  },

  // Get tickets for current tenant
  async getTenantTickets(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `/support-tickets?${queryParams}` : '/support-tickets';
    const response = await api.get(url);
    return response.data;
  },

  // Get all tickets (admin only)
  async getAllTickets(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/support-tickets/admin/tickets${queryParams ? '?' + queryParams : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get ticket by ID
  async getTicketById(ticketId) {
    const response = await api.get(`/support-tickets/${ticketId}`);
    return response.data;
  },

  // Update ticket (admin only)
  async updateTicket(ticketId, updateData) {
    const response = await api.patch(`/support-tickets/admin/tickets/${ticketId}`, updateData);
    return response.data;
  },

  // Add comment to ticket
  async addComment(ticketId, commentData) {
    const response = await api.post(`/support-tickets/${ticketId}/comments`, commentData);
    return response.data;
  },

  // Get comments for a ticket
  async getTicketComments(ticketId) {
    const response = await api.get(`/support-tickets/${ticketId}/comments`);
    return response.data;
  },

  // Resolve ticket (admin only)
  async resolveTicket(ticketId, resolutionData) {
    const response = await api.post(`/support-tickets/admin/tickets/${ticketId}/resolve`, resolutionData);
    return response.data;
  }
};