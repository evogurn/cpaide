import React, { useState } from 'react';
import { useCurrentUser } from '../hooks/useTenant';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form state for contact information
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    alternativePhone: '',
    timeZone: '',
    address: ''
  });
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Fetch user data with React Query
  const { data: userData, isLoading: isUserLoading, refetch } = useCurrentUser();

  // Get user data from the API response
  const user = userData || {
    firstName: 'Loading User',
    lastName: '',
    email: 'loading@example.com',
    avatar: '/assets/user/dp.png',
    emailVerified: false,
    phone: '',
    phoneVerified: false,
    alternativePhone: '',
    timeZone: '',
    address: ''
  };

  // Initialize contact info when user data loads
  React.useEffect(() => {
    if (userData) {
      setContactInfo({
        phone: userData.phone || '',
        alternativePhone: userData.alternativePhone || '',
        timeZone: userData.timeZone || '',
        address: userData.address || ''
      });
    }
  }, [userData]);

  // Dummy data for roles and permissions
  const rolesAndPermissions = {
    roles: [
      { id: 1, name: 'Administrator', description: 'Full access to all features and settings' },
      { id: 2, name: 'Editor', description: 'Can create, edit, and delete documents' }
    ],
    permissions: [
      { id: 1, name: 'View Documents', description: 'Ability to view all documents in the system' },
      { id: 2, name: 'Edit Documents', description: 'Ability to edit and modify documents' },
      { id: 3, name: 'Delete Documents', description: 'Ability to delete documents from the system' },
      { id: 4, name: 'Manage Users', description: 'Ability to add, edit, and remove users' },
      { id: 5, name: 'Access Reports', description: 'Ability to view analytics and reports' }
    ]
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      // Show error toast for invalid format
      showToast('Invalid file format. Please upload JPG, PNG, or WebP images.', 'error');
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size too large. Maximum size is 5MB.', 'error');
      return;
    }

    setNewProfileImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!newProfileImage) return;
    
    setIsUpdating(true);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate the update by updating local state
      setTimeout(() => {
        // Note: In a real implementation, we would update the query cache
        setNewProfileImage(null);
        setPreviewUrl(null);
        setIsUpdating(false);
        showToast('Profile picture updated successfully!', 'success');
      }, 1000);
    } catch (error) {
      setIsUpdating(false);
      showToast('Failed to update profile picture. Please try again.', 'error');
    }
  };

  const handleContactInfoChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveContactInfo = async () => {
    try {
      setIsUpdating(true);
      // Update user contact information
      await api.patch(`/users/${user.id}`, contactInfo);
      // Refetch user data to get updated information
      await refetch();
      setIsEditingContact(false);
      setIsUpdating(false);
      showToast('Contact information updated successfully!', 'success');
    } catch (error) {
      setIsUpdating(false);
      showToast('Failed to update contact information. Please try again.', 'error');
    }
  };

  const showToast = (message, type) => {
    // In a real app, we would use a proper toast library
    // For now, we'll just log to console
    console.log(`[${type}] ${message}`);
    
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  };

  // Show loading state
  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-dark-bg-primary">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 dark:bg-dark-bg-secondary">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 dark:text-dark-text-primary">Profile</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-dark-bg-primary">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 dark:bg-dark-bg-secondary">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 dark:text-dark-text-primary">Profile</h1>
          
          {/* Profile Picture Section */}
          <div className="mb-6">
            <div className="relative inline-block">
              <img
                src={previewUrl || user.avatar || '/assets/user/dp.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg dark:border-dark-bg-secondary"
              />
              <label className="absolute bottom-0 right-0 bg-accent rounded-full p-1 cursor-pointer shadow dark:bg-accent-dark">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleSave}
                disabled={!newProfileImage || isUpdating}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  !newProfileImage || isUpdating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-dark-bg-tertiary dark:text-dark-text-disabled'
                    : 'bg-accent text-accent-contrast hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-accent-dark'
                }`}
              >
                {isUpdating ? 'Updating...' : 'Save Picture'}
              </button>
              
              {newProfileImage && (
                <button
                  onClick={() => {
                    setNewProfileImage(null);
                    setPreviewUrl(null);
                  }}
                  className="ml-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-dark-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-accent text-accent dark:text-accent-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-accent text-accent dark:text-accent-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'
              }`}
            >
              Contact Information
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-accent text-accent dark:text-accent-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'
              }`}
            >
              Roles & Permissions
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">First Name</label>
                <div className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-gray-50 px-3 py-2 rounded-md dark:bg-dark-bg-tertiary">
                  {user.firstName || 'Not provided'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Last Name</label>
                <div className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-gray-50 px-3 py-2 rounded-md dark:bg-dark-bg-tertiary">
                  {user.lastName || 'Not provided'}
                </div>
              </div>
                            
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Employee ID</label>
                <div className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-gray-50 px-3 py-2 rounded-md dark:bg-dark-bg-tertiary">
                  EMP-{user.id || '00000'}
                </div>
              </div>
              
              
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Email Address</label>
                  {user.emailVerified && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Verified
                    </span>
                  )}
                </div>
                <div className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-gray-50 px-3 py-2 rounded-md dark:bg-dark-bg-tertiary">
                  {user.email}
                </div>
              </div>
              
              <div>
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Phone Number</label>
                  {user.phoneVerified && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Verified
                    </span>
                  )}
                </div>
                {isEditingContact ? (
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                    className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 dark:bg-dark-bg-secondary dark:border-dark-border"
                  />
                ) : (
                  <div className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-gray-50 px-3 py-2 rounded-md dark:bg-dark-bg-tertiary">
                    {user.phone || 'Not provided'}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Alternative Phone Number</label>
                {isEditingContact ? (
                  <input
                    type="tel"
                    value={contactInfo.alternativePhone}
                    onChange={(e) => handleContactInfoChange('alternativePhone', e.target.value)}
                    className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 dark:bg-dark-bg-secondary dark:border-dark-border"
                  />
                ) : (
                  <div className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-gray-50 px-3 py-2 rounded-md dark:bg-dark-bg-tertiary">
                    {user.alternativePhone || 'Not provided'}
                  </div>
                )}
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Address</label>
                {isEditingContact ? (
                  <textarea
                    value={contactInfo.address}
                    onChange={(e) => handleContactInfoChange('address', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 dark:bg-dark-bg-secondary dark:border-dark-border"
                  />
                ) : (
                  <div className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-gray-50 px-3 py-2 rounded-md dark:bg-dark-bg-tertiary">
                    {user.address || 'Not provided'}
                  </div>
                )}
              </div>
              
              <div className='sm:col-span-2'>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Time Zone</label>
                {isEditingContact ? (
                  <select
                    value={contactInfo.timeZone}
                    onChange={(e) => handleContactInfoChange('timeZone', e.target.value)}
                    className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 dark:bg-dark-bg-secondary dark:border-dark-border"
                  >
                    <option value="">Select Time Zone</option>
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Standard Time (EST)</option>
                    <option value="CST">Central Standard Time (CST)</option>
                    <option value="MST">Mountain Standard Time (MST)</option>
                    <option value="PST">Pacific Standard Time (PST)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                    <option value="IST">India Standard Time (IST)</option>
                  </select>
                ) : (
                  <div className="mt-1 block w-full text-gray-900 dark:text-dark-text-primary bg-gray-50 px-3 py-2 rounded-md dark:bg-dark-bg-tertiary">
                    {user.timeZone || 'Not provided'}
                  </div>
                )}
              </div>
              
              <div className="sm:col-span-2 flex justify-end space-x-3">
                {isEditingContact ? (
                  <>
                    <button
                      onClick={() => setIsEditingContact(false)}
                      className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveContactInfo}
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${
                        isUpdating
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-accent hover:bg-accent-dark dark:bg-accent-dark'
                      }`}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingContact(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-accent-dark"
                  >
                    Edit Contact Info
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Roles & Permissions Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">Assigned Roles</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {rolesAndPermissions.roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4 dark:border-dark-border">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-accent-light rounded-md p-2">
                          <svg className="h-6 w-6 text-accent-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">{role.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{role.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">Permissions</h3>
                <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-dark-bg-secondary">
                  <ul className="divide-y divide-gray-200 dark:divide-dark-border">
                    {rolesAndPermissions.permissions.map((permission) => (
                      <li key={permission.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                                <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <p className="ml-3 text-sm font-medium text-gray-900 dark:text-dark-text-primary">{permission.name}</p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{permission.description}</p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;