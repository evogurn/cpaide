import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import adminService from '../../services/adminService';
import { updateTenantPricing } from '../../services/adminService.js';
import TenantDiscountHistory from '../../components/admin/TenantDiscountHistory';
import ModalLoader from '../../components/ModalLoader';
import LoadingButton from '../../components/LoadingButton';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDiscountHistory, setShowDiscountHistory] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'verify'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterApprovalStatus, setFilterApprovalStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  // Fetch tenants from API
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tenants', currentPage, itemsPerPage, searchTerm, filterStatus, filterApprovalStatus],
    queryFn: () => adminService.getAllTenants({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      approvalStatus: filterApprovalStatus !== 'all' ? filterApprovalStatus : undefined,
    }),
    staleTime: 30000, // 30 seconds
  });


  useEffect(() => {
    if (data) {
      setTenants(data.tenants || []);
    }
  }, [data]);

  // Mutations for tenant actions
  const approveTenantMutation = useMutation({
    mutationFn: (tenantId) => adminService.approveTenant(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      // Also invalidate the pending tenants query if showing pending
      queryClient.invalidateQueries({ queryKey: ['pendingTenants'] });
    },
  });

  const rejectTenantMutation = useMutation({
    mutationFn: (tenantId) => adminService.rejectTenant(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['pendingTenants'] });
    },
  });

  const updateTenantStatusMutation = useMutation({
    mutationFn: ({ tenantId, status }) => adminService.updateTenantStatus(tenantId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ tenantId, data }) => adminService.updateTenant(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const handleApproveTenant = (tenantId) => {
    approveTenantMutation.mutate(tenantId);
  };

  const handleRejectTenant = (tenantId) => {
    rejectTenantMutation.mutate(tenantId);
  };

  const handleSuspendTenant = (tenantId) => {
    updateTenantStatusMutation.mutate({ tenantId, status: 'SUSPENDED' });
  };

  const handleActivateTenant = (tenantId) => {
    updateTenantStatusMutation.mutate({ tenantId, status: 'ACTIVE' });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getApprovalStatusColor = (approvalStatus) => {
    switch (approvalStatus?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const openModal = (type, tenant = null) => {
    setModalType(type);
    setSelectedTenant(tenant);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedTenant(null);
  };

  const openDiscountHistory = (tenant) => {
    setSelectedTenant(tenant);
    setShowDiscountHistory(true);
  };

  const closeDiscountHistory = () => {
    setShowDiscountHistory(false);
    setSelectedTenant(null);
  };


  
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Tenant data (only basic info, no billing)
    const tenantData = {
      name: formData.get('name'),
      subdomain: formData.get('subdomain'),
      status: formData.get('status'),
      approvalStatus: formData.get('approvalStatus'),
    };
    
    // Update tenant basic information
    updateTenantMutation.mutate({ tenantId: selectedTenant.id, data: tenantData });
    
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">Failed to load tenants data.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            Tenant Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
            Manage all tenants in the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Search Tenants
            </label>
            <input
              type="text"
              placeholder="Search by name, subdomain or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Filter by Approval Status
            </label>
            <select
              value={filterApprovalStatus}
              onChange={(e) => {
                setFilterApprovalStatus(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            >
              <option value="all">All Approval Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenant List */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Approval Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Subdomain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-bg-primary dark:divide-dark-border">
              {tenants.map((tenant) => (
                <tr 
                  key={tenant.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary ${tenant.approvalStatus === 'PENDING' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      {tenant.name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-dark-text-disabled mt-1">
                      {tenant.users?.length || 0} users
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getApprovalStatusColor(tenant.approvalStatus)} ${tenant.approvalStatus === 'PENDING' ? 'ring-2 ring-yellow-500 ring-offset-1' : ''}`}>
                      {tenant.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    {tenant.users?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    {tenant.subdomain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => openModal('edit', tenant)}
                        className="text-accent hover:text-accent-dark"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => openDiscountHistory(tenant)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Discounts
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-dark-text-primary">
              Showing <span className="font-medium">{(data.pagination.page - 1) * data.pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)}
              </span>{' '}
              of <span className="font-medium">{data.pagination.total}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={data.pagination.page === 1}
                className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.pagination.pages))}
                disabled={data.pagination.page === data.pagination.pages}
                className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                  {modalType === 'edit' ? 'Edit Tenant' : 'Tenant Details'}
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                  disabled={updateTenantMutation.isPending}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
                    
              <form onSubmit={handleModalSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Tenant Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedTenant?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                      required
                      disabled={updateTenantMutation.isPending}
                    />
                  </div>
                        
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Subdomain
                    </label>
                    <input
                      type="text"
                      name="subdomain"
                      defaultValue={selectedTenant?.subdomain || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                      required
                      disabled={updateTenantMutation.isPending}
                    />
                  </div>
                        
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Status
                    </label>
                    <select 
                      name="status"
                      defaultValue={selectedTenant?.status || 'ACTIVE'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                      disabled={updateTenantMutation.isPending}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                        
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Approval Status
                    </label>
                    <select 
                      name="approvalStatus"
                      defaultValue={selectedTenant?.approvalStatus || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                      disabled={updateTenantMutation.isPending}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                        
                        
                        
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                      Created At
                    </label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary">
                      {selectedTenant?.createdAt ? new Date(selectedTenant.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
                      
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-secondary"
                    disabled={updateTenantMutation.isPending}
                  >
                    Cancel
                  </button>
                  {modalType === 'edit' && (
                    <LoadingButton
                      type="submit"
                      loading={updateTenantMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-accent-contrast bg-accent hover:bg-accent-dark rounded-md"
                    >
                      Save Changes
                    </LoadingButton>
                  )}
                </div>
              </form>
            </div>
          </div>
          <ModalLoader open={updateTenantMutation.isPending} />
        </div>
      )}
        
      {/* Discount History Modal */}
      <TenantDiscountHistory 
        tenantId={selectedTenant?.id} 
        isOpen={showDiscountHistory} 
        onClose={closeDiscountHistory} 
      />
    </div>
  );
};

export default TenantManagement;