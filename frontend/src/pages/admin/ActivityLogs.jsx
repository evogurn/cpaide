import React, { useState, useEffect } from 'react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterTenant, setFilterTenant] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  // Mock data for activity logs
  useEffect(() => {
    const mockLogs = [];
    const actions = [
      'user_login', 'user_logout', 'document_created', 'document_updated', 
      'document_deleted', 'folder_created', 'folder_deleted', 'tenant_created',
      'tenant_updated', 'admin_action', 'file_uploaded', 'file_downloaded'
    ];
    const tenants = ['ABC Construction', 'XYZ Builders', 'Modern Architecture', 'Tech Construction'];
    const users = ['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Brown', 'Mike Wilson', 'Sarah Davis'];

    for (let i = 0; i < 100; i++) {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomTenant = tenants[Math.floor(Math.random() * tenants.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      mockLogs.push({
        id: i + 1,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        action: randomAction,
        user: randomUser,
        tenant: randomTenant,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: `Action performed on ${randomAction.replace('_', ' ')}`
      });
    }

    // Sort by timestamp descending (most recent first)
    mockLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setLogs(mockLogs);
  }, []);

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesTenant = filterTenant === 'all' || log.tenant === filterTenant;
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && new Date(log.timestamp) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(log.timestamp) <= new Date(dateRange.end);
    }
    
    return matchesSearch && matchesAction && matchesTenant && matchesUser && matchesDate;
  });

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getActionColor = (action) => {
    switch (action) {
      case 'user_login':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'user_logout':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'document_created':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'document_updated':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'document_deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'folder_created':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'admin_action':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'user_login': return 'User Login';
      case 'user_logout': return 'User Logout';
      case 'document_created': return 'Document Created';
      case 'document_updated': return 'Document Updated';
      case 'document_deleted': return 'Document Deleted';
      case 'folder_created': return 'Folder Created';
      case 'folder_deleted': return 'Folder Deleted';
      case 'tenant_created': return 'Tenant Created';
      case 'tenant_updated': return 'Tenant Updated';
      case 'admin_action': return 'Admin Action';
      case 'file_uploaded': return 'File Uploaded';
      case 'file_downloaded': return 'File Downloaded';
      default: return action.replace('_', ' ').toUpperCase();
    }
  };

  // Get unique tenants and users for filters
  const uniqueTenants = ['all', ...new Set(logs.map(log => log.tenant))];
  const uniqueUsers = ['all', ...new Set(logs.map(log => log.user))];
  const uniqueActions = ['all', ...new Set(logs.map(log => log.action))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            Activity Logs
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
            Comprehensive audit trail of all system activities
          </p>
        </div>
        <button className="bg-accent hover:bg-accent-dark text-accent-contrast px-4 py-2 rounded-md text-sm font-medium">
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Search Logs
            </label>
            <input
              type="text"
              placeholder="Search by user, tenant, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Filter by Action
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            >
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action === 'all' ? 'All Actions' : getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Filter by Tenant
            </label>
            <select
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            >
              {uniqueTenants.map(tenant => (
                <option key={tenant} value={tenant}>
                  {tenant === 'all' ? 'All Tenants' : tenant}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Filter by User
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            >
              {uniqueUsers.map(user => (
                <option key={user} value={user}>
                  {user === 'all' ? 'All Users' : user}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-bg-primary dark:divide-dark-border">
              {currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    {log.tenant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-text-secondary max-w-xs">
                    <div className="truncate" title={log.details}>
                      {log.details}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-dark-text-primary">
            Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-disabled'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-secondary'
              }`}
            >
              Previous
            </button>
            
            <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-dark-text-primary">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-disabled'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-secondary'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;