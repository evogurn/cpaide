import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';
import { supportTicketService } from '../services/supportTicketService';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const Support = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM'
  });
  const [ticketDetail, setTicketDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);

  const navigate = useNavigate();

  // Fetch user's tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await supportTicketService.getTenantTickets();
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket details and comments
  const fetchTicketDetail = async (ticketId) => {
    try {
      const response = await supportTicketService.getTicketById(ticketId);
      setTicketDetail(response.data);
      
      // Also fetch comments for this ticket
      const commentsResponse = await supportTicketService.getTicketComments(ticketId);
      setComments(commentsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
    }
  };

  // Handle form submission
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setCreatingTicket(true);
    try {
      await supportTicketService.createTicket(ticketForm);
      setTicketForm({ title: '', description: '', priority: 'MEDIUM' });
      setActiveTab('my-tickets');
      fetchTickets(); // Refresh the list
      showSuccessToast('Ticket created successfully!');
    } catch (error) {
      console.error('Failed to create ticket:', error);
      showErrorToast(error.response?.data?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setCreatingTicket(false);
    }
  };

  // Handle adding a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      await supportTicketService.addComment(ticketDetail.id, { comment: newComment });
      setNewComment('');
      
      // Refresh comments
      const commentsResponse = await supportTicketService.getTicketComments(ticketDetail.id);
      setComments(commentsResponse.data || []);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  useEffect(() => {
    if (ticketDetail) {
      fetchTicketDetail(ticketDetail.id);
    }
  }, [ticketDetail?.id]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityClasses = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses[priority]}`}>
        {priority}
      </span>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusClasses = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      RESOLVED: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-8">Support</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-dark-border mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Ticket
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'my-tickets'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'
            }`}
            onClick={() => setActiveTab('my-tickets')}
          >
            My Tickets
          </button>
        </div>

        {/* Create Ticket Tab */}
        {activeTab === 'create' && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-dark-text-primary">Create New Support Ticket</h2>
            <form onSubmit={handleSubmitTicket}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Description
                </label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  placeholder="Detailed description of your issue..."
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Priority
                </label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg-primary dark:text-dark-text-primary"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              
              <LoadingButton
                type="submit"
                loading={creatingTicket}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Create Ticket
              </LoadingButton>
            </form>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'my-tickets' && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 dark:text-dark-text-secondary">No support tickets found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setTicketDetail(ticket);
                      setActiveTab('ticket-detail');
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                        {ticket.title}
                      </h3>
                      <div className="flex space-x-2">
                        <PriorityBadge priority={ticket.priority} />
                        <StatusBadge status={ticket.status} />
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-dark-text-secondary mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-dark-text-secondary">
                      <span>Created: {formatDate(ticket.createdAt)}</span>
                      <span>Comments: {ticket.comments?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ticket Detail View */}
        {activeTab === 'ticket-detail' && ticketDetail && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                  {ticketDetail.title}
                </h2>
                <div className="flex space-x-2 mb-2">
                  <PriorityBadge priority={ticketDetail.priority} />
                  <StatusBadge status={ticketDetail.status} />
                </div>
              </div>
              <button
                onClick={() => setActiveTab('my-tickets')}
                className="text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
              >
                Back to Tickets
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-dark-text-primary mb-2">Description</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary">{ticketDetail.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-dark-text-primary mb-2">Comments</h3>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-200 dark:border-dark-border pl-4 py-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                        {comment.createdByUser.firstName} {comment.createdByUser.lastName}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-dark-text-secondary">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-dark-text-secondary">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Add Comment
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg-primary dark:text-dark-text-primary"
                  placeholder="Add your comment..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={commentLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
              >
                {commentLoading ? 'Adding...' : 'Add Comment'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;