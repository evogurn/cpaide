import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserFormModal from '../components/UserFormModal';
import FolderAccessModal from '../components/FolderAccessModal';
import DeleteUserModal from '../components/DeleteUserModal';
import userService from '../services/userService';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const UserManagement = () => {
  const queryClient = useQueryClient();
  
  const [roles, setRoles] = useState([]);
  
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isFolderAccessOpen, setIsFolderAccessOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Queries
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.listUsers(),
  });
  
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => userService.listRoles(),
    onSuccess: (data) => setRoles(data || []),
  });
  
  // Mutations
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => userService.deleteUser(userId),
    onSuccess: () => {
      showSuccessToast('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      showErrorToast('Failed to delete user');
    },
  });
  
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => userService.updateUser(userId, data),
    onSuccess: () => {
      showSuccessToast('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      showErrorToast('Failed to update user');
    },
  });
  
  const createUserMutation = useMutation({
    mutationFn: (userData) => userService.createUser(userData),
    onSuccess: () => {
      showSuccessToast('User created and invitation email sent');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      showErrorToast('Failed to create user');
    },
  });
  
  const users = usersData?.users || [];

  useEffect(() => {
    // Users and roles are loaded via queries
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteUserOpen(true);
  };

  const confirmDeleteUser = () => {
    deleteUserMutation.mutate(userToDelete.id);
    setIsDeleteUserOpen(false);
    setUserToDelete(null);
  };

  const handleSaveUser = async (userData) => {
    if (editingUser) {
      // Update existing user
      const nameParts = userData.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';
      
      // Update user info
      updateUserMutation.mutate({
        userId: editingUser.id,
        data: {
          firstName,
          lastName,
          email: userData.email,
          status: userData.status.toUpperCase(),
        }
      });
      
      // If role changed, assign it separately
      if (userData.roleId) {
        await userService.assignRoles(editingUser.id, [userData.roleId]);
      }
    } else {
      // Add new user
      const nameParts = userData.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';
      
      createUserMutation.mutate({
        firstName,
        lastName,
        email: userData.email,
        roleIds: userData.roleId ? [userData.roleId] : [],
      });
    }
    
    setIsUserFormOpen(false);
  };

  const handleManageFolderAccess = (user) => {
    setSelectedUser(user);
    setIsFolderAccessOpen(true);
  };

  const handleSaveFolderAccess = (accessData) => {
    // In a real app, this would save the folder access permissions
    console.log('Saving folder access for user:', selectedUser, accessData);
    setIsFolderAccessOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">User Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">Manage construction project users and their permissions.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            type="button"
            onClick={handleAddUser}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg dark:bg-dark-bg-secondary dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.3)]">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary">Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Permissions
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-dark-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-bg-secondary dark:divide-dark-border">
              {isUsersLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-dark-text-secondary">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-dark-text-secondary">
                    No users found.
                  </td>
                </tr>
              ) : users.map((user) => {
                const fullName = `${user.firstName} ${user.lastName}`;
                const userRole = user.userRoles?.[0]?.role?.name || 'No Role';
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg-primary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-contrast font-semibold">
                            {user.firstName?.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">{fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        userRole === 'TENANT_ADMIN' || userRole === 'Admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {userRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      <button
                        onClick={() => handleManageFolderAccess(user)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                      >
                        <svg className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Edit
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser({ ...user, name: fullName, role: userRole })}
                        className="text-accent hover:text-accent-dark mr-3 dark:text-accent-light dark:hover:text-accent"
                        title="Edit"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {isUserFormOpen && (
        <UserFormModal
          user={editingUser}
          roles={roles}
          onSave={handleSaveUser}
          onClose={() => setIsUserFormOpen(false)}
          isSubmitting={editingUser ? updateUserMutation.isPending : createUserMutation.isPending}
        />
      )}

      {/* Folder Access Modal */}
      {isFolderAccessOpen && (
        <FolderAccessModal
          user={selectedUser}
          onSave={handleSaveFolderAccess}
          onClose={() => setIsFolderAccessOpen(false)}
        />
      )}

      {/* Delete User Modal */}
      {isDeleteUserOpen && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => setIsDeleteUserOpen(false)}
          onConfirm={confirmDeleteUser}
        />
      )}
    </div>
  );
};

export default UserManagement;