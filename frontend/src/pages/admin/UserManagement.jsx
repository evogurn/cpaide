import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingButton from '../../components/LoadingButton';

const UserManagement = () => {
  const queryClient = useQueryClient();
  
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'reset-password'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTenant, setFilterTenant] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [newPassword, setNewPassword] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tenantId: '',
    status: 'ACTIVE'
  });
  
  // Queries
  const { isLoading: isDataLoading } = useQuery({
    queryKey: ['admin-users-and-tenants'],
    queryFn: async () => {
      const [usersData, tenantsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllTenants({ limit: 100 })
      ]);
      setUsers(usersData.users || []);
      setTenants(tenantsData.tenants || []);
      return { users: usersData.users, tenants: tenantsData.tenants };
    },
  });
  
  // Mutations
  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password }) => adminService.resetUserPassword(userId, password),
    onSuccess: () => {
      showSuccessToast('Password reset successfully');
      setNewPassword('');
      closeModal();
    },
    onError: (error) => {
      showErrorToast(error.message || 'Failed to reset password');
    },
  });
  
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => adminService.updateUserAdmin(userId, data),
    onSuccess: () => {
      showSuccessToast('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users-and-tenants'] });
      closeModal();
    },
    onError: (error) => {
      showErrorToast(error.message || 'Failed to save user');
    },
  });
  
  const createUserMutation = useMutation({
    mutationFn: (userData) => adminService.createUserAdmin(userData),
    onSuccess: () => {
      showSuccessToast('User created and invitation email sent');
      queryClient.invalidateQueries({ queryKey: ['admin-users-and-tenants'] });
      closeModal();
    },
    onError: (error) => {
      showErrorToast(error.message || 'Failed to create user');
    },
  });

  useEffect(() => {
    // Data is loaded via the query above
  }, []);

  const handleSuspendUser = async (userId) => {
    try {
      await adminService.updateUserStatus(userId, 'SUSPENDED');
      showSuccessToast('User suspended successfully');
      fetchData();
    } catch (error) {
      showErrorToast('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminService.updateUserStatus(userId, 'ACTIVE');
      showSuccessToast('User activated successfully');
      fetchData();
    } catch (error) {
      showErrorToast('Failed to activate user');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    
    resetPasswordMutation.mutate({ userId: selectedUser.id, password: newPassword });
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action is irreversible.')) {
      try {
        await adminService.deleteUserAdmin(userId);
        showSuccessToast('User deleted successfully');
        fetchData();
      } catch (error) {
        showErrorToast('Failed to delete user');
      }
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    if (modalType === 'edit') {
      // Update existing user
      const nameParts = formData.firstName.trim().split(/\s+/);
      let firstName = formData.firstName;
      let lastName = formData.lastName;
      
      if (nameParts.length > 1 && !lastName) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }
      
      updateUserMutation.mutate({ 
        userId: selectedUser.id, 
        data: { ...formData, firstName, lastName } 
      });
    } else {
      // Create new user
      const nameParts = formData.firstName.trim().split(/\s+/);
      let firstName = formData.firstName;
      let lastName = formData.lastName;
      
      if (nameParts.length > 1 && !lastName) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }
      
      createUserMutation.mutate({
        firstName,
        lastName: lastName || '-',
        email: formData.email,
        tenantId: formData.tenantId,
        status: formData.status
      });
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleColor = (role) => {
    const r = role?.toLowerCase();
    if (r?.includes('admin')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    }
    if (r === 'user' || r?.includes('supervisor')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tenantId: user.tenantId,
        status: user.status
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        tenantId: tenants[0]?.id || '',
        status: 'ACTIVE'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedUser(null);
    setNewPassword('');
  };

  // Get unique tenants for filter dropdown
  const uniqueTenants = ['all', ...new Set(tenants.map(t => t.name))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            User Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
            Manage all users across all tenants
          </p>
        </div>
        <button 
          onClick={() => openModal('create')}
          className="bg-accent hover:bg-accent-dark text-accent-contrast px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            />
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
              <option value="all">All Tenants</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.name}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
            >
              <option value="all">All Roles</option>
              <option value="SUPER_ADMIN">Master Admin</option>
              <option value="TENANT_ADMIN">Tenant Admin</option>
              <option value="USER">Standard User</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-bg-primary dark:divide-dark-border">
              {isDataLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Loading users...</td>
                </tr>
              ) : (users.filter(user => {
                const fullName = `${user.firstName} ${user.lastName}`;
                const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     user.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesTenant = filterTenant === 'all' || user.tenant?.name === filterTenant;
                const roleName = user.userRoles?.[0]?.role?.name || 'user';
                const matchesRole = filterRole === 'all' || roleName.toLowerCase() === filterRole.toLowerCase();
                return matchesSearch && matchesTenant && matchesRole;
              }).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    {user.tenant?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.userRoles?.[0]?.role?.name || 'user')}`}>
                      {user.userRoles?.[0]?.role?.name || 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status.toLowerCase())}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openModal('edit', user)}
                        className="text-accent hover:text-accent-dark"
                      >
                        Edit
                      </button>
                      {user.status === 'SUSPENDED' ? (
                        <button 
                          onClick={() => handleActivateUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Activate
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSuspendUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Suspend
                        </button>
                      )}
                      <button 
                        onClick={() => openModal('reset-password', user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Reset Password
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-800 hover:text-red-950"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">
                {modalType === 'create' ? 'Create New User' : 
                 modalType === 'edit' ? 'Edit User' : 'Reset Password'}
              </h3>
              
              <form onSubmit={modalType === 'reset-password' ? handleResetPassword : handleSaveUser}>
                <div className="space-y-4">
                  {modalType !== 'reset-password' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                          Tenant
                        </label>
                        <select 
                          required
                          value={formData.tenantId}
                          onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                        >
                          {tenants.map(tenant => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                          Status
                        </label>
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="SUSPENDED">Suspended</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {modalType === 'reset-password' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-secondary"
                  >
                    Cancel
                  </button>
                  {modalType === 'reset-password' ? (
                    <LoadingButton
                      type="submit"
                      loading={resetPasswordMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-accent-contrast bg-accent hover:bg-accent-dark rounded-md"
                    >
                      Reset Password
                    </LoadingButton>
                  ) : (
                    <LoadingButton
                      type="submit"
                      loading={modalType === 'edit' ? updateUserMutation.isPending : createUserMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-accent-contrast bg-accent hover:bg-accent-dark rounded-md"
                    >
                      {modalType === 'create' ? 'Create' : 'Save Changes'}
                    </LoadingButton>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;