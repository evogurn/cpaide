import React, { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '../utils/toastUtils';

const UserFormModal = ({ user, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Site Supervisor');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setStatus(user.status);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show loading toast
    const toastId = showLoadingToast(user ? 'Updating user...' : 'Creating user...');
    
    try {
      await onSave({ name, email, role, status });
      
      // Dismiss loading toast and show success
      dismissToast(toastId);
      showSuccessToast(`User ${user ? 'updated' : 'created'} successfully!`);
      
      // Close the modal
      onClose();
    } catch (error) {
      // Dismiss loading toast and show error
      dismissToast(toastId);
      showErrorToast(`Failed to ${user ? 'update' : 'create'} user. Please try again.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-dark-bg-secondary">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-dark-bg-secondary">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary">
                    {user ? 'Edit User' : 'Add New User'}
                  </h3>
                  <div className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                          Full Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                            placeholder="Enter full name"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                          Email Address
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                            placeholder="Enter email address"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                          Role
                        </label>
                        <div className="mt-1">
                          <CustomSelect
                            id="role"
                            name="role"
                            value={role}
                            onChange={setRole}
                            options={[
                              { value: 'Admin', label: 'Admin' },
                              { value: 'Site Supervisor', label: 'Site Supervisor' },
                              { value: 'Accountant', label: 'Accountant' },
                              { value: 'Trade/Vendor', label: 'Trade/Vendor' },
                              { value: 'Sales Agent', label: 'Sales Agent' },
                              { value: 'Buyer', label: 'Buyer' },
                              { value: 'Customer Care', label: 'Customer Care / Buyer Support' },
                            ]}
                            placeholder="Select a role"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                          Status
                        </label>
                        <div className="mt-1">
                          <CustomSelect
                            id="status"
                            name="status"
                            value={status}
                            onChange={setStatus}
                            options={[
                              { value: 'Active', label: 'Active' },
                              { value: 'Inactive', label: 'Inactive' },
                            ]}
                            placeholder="Select status"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-dark-bg-tertiary">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-accent-contrast hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:ml-3 sm:w-auto sm:text-sm"
              >
                {user ? 'Update' : 'Create'} User
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;