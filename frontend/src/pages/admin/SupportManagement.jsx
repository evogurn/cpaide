import React, { useState, useEffect } from 'react';

const SupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'reply'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [replyMessage, setReplyMessage] = useState('');

  // Mock data for support tickets
  useEffect(() => {
    setTickets([
      {
        id: 1,
        subject: 'Billing Issue',
        description: 'Customer is having trouble with their subscription payment.',
        category: 'billing',
        status: 'open',
        priority: 'high',
        tenant: 'ABC Construction',
        user: 'John Smith',
        createdAt: '2024-12-20',
        updatedAt: '2024-12-20',
        messages: [
          {
            id: 1,
            sender: 'John Smith',
            content: 'I\'m having trouble with my subscription payment. It keeps failing.',
            timestamp: '2024-12-20T10:30:00Z'
          }
        ]
      },
      {
        id: 2,
        subject: 'Document Upload Issue',
        description: 'User unable to upload large PDF files.',
        category: 'technical',
        status: 'in-progress',
        priority: 'medium',
        tenant: 'XYZ Builders',
        user: 'Bob Johnson',
        createdAt: '2024-12-21',
        updatedAt: '2024-12-21',
        messages: [
          {
            id: 1,
            sender: 'Bob Johnson',
            content: 'I\'m trying to upload a 500MB PDF file but it keeps failing. Is there a size limit?',
            timestamp: '2024-12-21T14:15:00Z'
          },
          {
            id: 2,
            sender: 'Support Agent',
            content: 'Hi Bob, our current file size limit is 100MB. You might need to compress the file or split it into smaller parts.',
            timestamp: '2024-12-21T15:20:00Z'
          }
        ]
      },
      {
        id: 3,
        subject: 'Feature Request',
        description: 'Request for bulk document deletion feature.',
        category: 'feature',
        status: 'pending',
        priority: 'low',
        tenant: 'Modern Architecture',
        user: 'Mike Wilson',
        createdAt: '2024-12-22',
        updatedAt: '2024-12-22',
        messages: [
          {
            id: 1,
            sender: 'Mike Wilson',
            content: 'It would be great if we could select multiple documents at once and delete them in bulk.',
            timestamp: '2024-12-22T09:45:00Z'
          }
        ]
      },
      {
        id: 4,
        subject: 'Login Problem',
        description: 'User unable to log in to their account.',
        category: 'technical',
        status: 'resolved',
        priority: 'high',
        tenant: 'Tech Construction',
        user: 'Alice Brown',
        createdAt: '2024-12-19',
        updatedAt: '2024-12-20',
        messages: [
          {
            id: 1,
            sender: 'Alice Brown',
            content: 'I\'m locked out of my account. I\'ve tried resetting my password but it\'s not working.',
            timestamp: '2024-12-19T16:30:00Z'
          },
          {
            id: 2,
            sender: 'Support Agent',
            content: 'Hi Alice, I\'ve reset your account password. Please check your email for the new credentials.',
            timestamp: '2024-12-20T10:15:00Z'
          },
          {
            id: 3,
            sender: 'Alice Brown',
            content: 'Thanks! I was able to log in successfully.',
            timestamp: '2024-12-20T10:20:00Z'
          }
        ]
      }
    ]);
  }, []);

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    ));
  };

  const handleReply = (ticketId) => {
    if (!replyMessage.trim()) return;

    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        const newMessage = {
          id: Date.now(),
          sender: 'Support Agent',
          content: replyMessage,
          timestamp: new Date().toISOString()
        };
        return {
          ...ticket,
          messages: [...ticket.messages, newMessage],
          status: 'in-progress',
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return ticket;
    }));

    setReplyMessage('');
    setShowModal(false);
    setSelectedTicket(null);
  };

  const openTicketModal = (type, ticket) => {
    setModalType(type);
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedTicket(null);
    setReplyMessage('');
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'billing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'feature':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            Support Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
            Manage support tickets from all tenants and users
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Search Tickets
            </label>
            <input
              type="text"
              placeholder="Search by subject, description, tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="feature">Feature Request</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-accent hover:bg-accent-dark text-accent-contrast px-4 py-2 rounded-md text-sm font-medium">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-bg-primary dark:divide-dark-border">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      {ticket.subject}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-dark-text-secondary line-clamp-1">
                      {ticket.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                      {ticket.tenant}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                      {ticket.user}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(ticket.category)}`}>
                      {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    {ticket.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openTicketModal('view', ticket)}
                        className="text-accent hover:text-accent-dark"
                      >
                        View
                      </button>
                      {ticket.status !== 'resolved' && (
                        <button 
                          onClick={() => openTicketModal('reply', ticket)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Reply
                        </button>
                      )}
                      {ticket.status !== 'resolved' && (
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="pending">Pending</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                    {selectedTicket.subject}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(selectedTicket.category)}`}>
                      {selectedTicket.category.charAt(0).toUpperCase() + selectedTicket.category.slice(1)}
                    </span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                    </span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  From: {selectedTicket.user} ({selectedTicket.tenant})
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  Created: {selectedTicket.createdAt} | Updated: {selectedTicket.updatedAt}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 dark:text-dark-text-primary">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-dark-border pt-4 mb-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-dark-text-primary mb-3">
                  Conversation
                </h4>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-3 rounded-lg ${
                        message.sender === 'Support Agent' 
                          ? 'bg-blue-50 dark:bg-blue-900/20' 
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-900 dark:text-dark-text-primary">
                          {message.sender}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-dark-text-primary">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {modalType === 'reply' && (
                <div className="border-t border-gray-200 dark:border-dark-border pt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Reply to Ticket
                    </label>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                      placeholder="Type your response here..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReply(selectedTicket.id)}
                      className="px-4 py-2 text-sm font-medium text-accent-contrast bg-accent hover:bg-accent-dark rounded-md"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'view' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => openTicketModal('reply', selectedTicket)}
                    className="px-4 py-2 text-sm font-medium text-accent-contrast bg-accent hover:bg-accent-dark rounded-md"
                  >
                    Reply to Ticket
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManagement;