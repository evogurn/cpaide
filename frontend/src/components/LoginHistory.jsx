import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loginHistoryService } from '../services/loginHistoryService';

const LoginHistory = ({ userId = null }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  // Fetch login history based on whether userId is provided
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['loginHistory', { userId, page, limit, startDate, endDate, status }],
    queryFn: () => {
      const params = {
        page,
        limit,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(status && { status }),
      };

      if (userId) {
        // Get specific user's login history
        return loginHistoryService.getTenantLoginHistory({ ...params, userId });
      } else {
        // Get current user's login history
        return loginHistoryService.getUserLoginHistory(params);
      }
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    // Reset to first page when filters change
    setPage(1);
  }, [startDate, endDate, status]);

  const handleFilterChange = () => {
    refetch();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatus('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">Failed to load login history: {error.message}</span>
      </div>
    );
  }

  const history = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="flex-1 bg-accent hover:bg-accent-dark text-accent-contrast font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Clear
            </button>
          
          </div>
        </div>
      </div>

      {/* Login History Table */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  IP Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  User Agent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-bg-secondary dark:divide-dark-border">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-dark-text-secondary">
                    No login history found
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        {record.user ? `${record.user.firstName} ${record.user.lastName}` : 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                        {record.user ? record.user.email : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-dark-text-primary">{record.ipAddress || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-dark-text-primary max-w-xs truncate" title={record.userAgent}>
                        {record.userAgent || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.loginStatus === 'SUCCESS' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' 
                          : record.loginStatus === 'FAILED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300'
                      }`}>
                        {record.loginStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      {new Date(record.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 dark:bg-dark-bg-secondary dark:border-dark-border sm:px-6">
            <div className="flex-1 flex justify-between sm:justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-dark-text-primary mr-4">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page <= 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-disabled' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-primary'
                  }`}
                >
                  Previous
                </button>
                
                <button
                  onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page >= pagination.pages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page >= pagination.pages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-disabled' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-primary'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHistory;