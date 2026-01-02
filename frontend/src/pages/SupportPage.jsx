import React, { useState, useEffect } from 'react';
import { supportTickets, currentUser } from '../data/index';
import { toast } from 'sonner';

const SupportPage = () => {
  const [tickets, setTickets] = useState(supportTickets);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    user: 'all'
  });
  const [sortBy, setSortBy] = useState('newest');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});

  // Check if user is admin (for demo purposes, we'll assume John Doe is a regular user)
  const isAdmin = currentUser.role === 'Admin';

  // Filter and sort tickets
  const filteredAndSortedTickets = tickets
    .filter(ticket => {
      if (filters.status !== 'all' && ticket.status !== filters.status) return false;
      if (!isAdmin && ticket.userId !== 'usr_123') return false; // For demo, only show user's own tickets
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

  const handleCreateTicket = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!title.trim() || title.length < 3 || title.length > 100) {
      newErrors.title = 'Title must be between 3 and 100 characters';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create new ticket
    const newTicket = {
      id: `tkt_${Date.now()}`,
      title,
      description,
      user: currentUser.name,
      userId: 'usr_123',
      createdAt: new Date().toISOString(),
      status: 'Open',
      priority: 'Normal',
      attachments: attachments.map(file => URL.createObjectURL(file)),
      comments: []
    };
    
    setTickets([newTicket, ...tickets]);
    resetForm();
    setShowCreateForm(false);
    toast.success('Ticket created successfully!');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAttachments([]);
    setErrors({});
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length !== files.length) {
      toast.error('Only image files are allowed');
      return;
    }
    
    setAttachments(prev => [...prev, ...imageFiles]);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicket.id) {
        const newCommentObj = {
          id: `cmt_${Date.now()}`,
          author: currentUser.name,
          authorRole: currentUser.role,
          message: newComment,
          timestamp: new Date().toISOString()
        };
        return {
          ...ticket,
          comments: [...ticket.comments, newCommentObj]
        };
      }
      return ticket;
    });
    
    setTickets(updatedTickets);
    setSelectedTicket({
      ...selectedTicket,
      comments: [...selectedTicket.comments, {
        id: `cmt_${Date.now()}`,
        author: currentUser.name,
        authorRole: currentUser.role,
        message: newComment,
        timestamp: new Date().toISOString()
      }]
    });
    setNewComment('');
    toast.success('Comment added successfully!');
  };

  const handleStatusChange = (ticketId, newStatus) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, status: newStatus };
      }
      return ticket;
    });
    
    setTickets(updatedTickets);
    
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
    
    toast.success(`Ticket status updated to ${newStatus}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Support</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
          {isAdmin 
            ? 'Manage support tickets from all users' 
            : 'Submit and track your support requests'}
        </p>
      </div>

      {/* Create Ticket Button */}
      {!showCreateForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-offset-dark-bg-secondary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Ticket
          </button>
        </div>
      )}

      {/* Create Ticket Form */}
      {showCreateForm && (
        <div className="mb-6 bg-white shadow rounded-lg p-6 dark:bg-dark-bg-secondary">
          <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">Create New Ticket</h2>
          <form onSubmit={handleCreateTicket}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of the issue"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Detailed description of the issue..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                  Attachments (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-dark-border">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-dark-text-secondary">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-accent hover:text-accent-dark dark:bg-dark-bg-secondary">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          multiple 
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-dark-text-disabled">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                {attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-1 dark:bg-dark-bg-tertiary">
                        <svg className="h-4 w-4 text-gray-500 mr-1 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate max-w-xs dark:text-dark-text-primary">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters for Admin */}
      {isAdmin && (
        <div className="mb-6 bg-white shadow rounded-lg p-4 dark:bg-dark-bg-secondary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                Status
              </label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                Sort By
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="flex-1 overflow-hidden">
        <div className="bg-white shadow rounded-lg h-full dark:bg-dark-bg-secondary">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary">
              {isAdmin ? 'All Support Tickets' : 'My Tickets'}
            </h3>
          </div>
          <div className="overflow-y-auto h-full">
            {filteredAndSortedTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <svg className="h-12 w-12 text-gray-400 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">No tickets</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
                  {isAdmin 
                    ? 'No support tickets have been submitted yet.' 
                    : 'Get started by creating a new support ticket.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredAndSortedTickets.map((ticket) => (
                  <li 
                    key={ticket.id} 
                    className="px-4 py-4 hover:bg-gray-50 cursor-pointer dark:hover:bg-dark-bg-primary"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-dark-text-primary">
                            {ticket.title}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-dark-text-secondary">
                          <span>{ticket.user}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 truncate dark:text-dark-text-secondary">
                          {ticket.description.substring(0, 100)}{ticket.description.length > 100 ? '...' : ''}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div 
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={() => setSelectedTicket(null)}
              ></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6 dark:bg-dark-bg-secondary">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary">
                      {selectedTicket.title}
                    </h3>
                    <div className="mt-1 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 dark:text-dark-text-secondary">
                        Submitted by {selectedTicket.user} on {formatDate(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setSelectedTicket(null)}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4">
                  <div className="border-b border-gray-200 dark:border-dark-border">
                    <h4 className="text-md font-medium text-gray-900 dark:text-dark-text-primary">Description</h4>
                    <p className="mt-2 text-sm text-gray-700 dark:text-dark-text-primary">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                    <div className="mt-4 border-b border-gray-200 dark:border-dark-border">
                      <h4 className="text-md font-medium text-gray-900 dark:text-dark-text-primary">Attachments</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedTicket.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-2 dark:bg-dark-bg-tertiary">
                            <svg className="h-5 w-5 text-gray-500 mr-2 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-700 dark:text-dark-text-primary">Screenshot {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Status Change */}
                  {isAdmin && (
                    <div className="mt-4 border-b border-gray-200 dark:border-dark-border">
                      <h4 className="text-md font-medium text-gray-900 dark:text-dark-text-primary">Update Status</h4>
                      <div className="mt-2 flex items-center">
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-dark-text-primary">Comments</h4>
                    <div className="mt-2 space-y-4">
                      {selectedTicket.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4 dark:bg-dark-bg-tertiary">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                              {comment.author}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-dark-text-secondary">
                              {comment.authorRole === 'Admin' ? '(Admin)' : '(User)'}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-dark-text-secondary">
                              {formatDate(comment.timestamp)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-700 dark:text-dark-text-primary">
                            {comment.message}
                          </p>
                        </div>
                      ))}
                      
                      {/* Add Comment Form */}
                      <div className="mt-4">
                        <textarea
                          rows={3}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                          placeholder="Add a comment..."
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={handleAddComment}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                          >
                            Add Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;