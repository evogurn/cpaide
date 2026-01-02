import React, { useState, useEffect } from 'react';
import CustomSelect from '../components/CustomSelect';
import FeatureSliderManager from '../components/FeatureSliderManager';
import DashboardTab from './Settings/DashboardTab';
import { getSetting, setSetting } from '../utils/settingsUtils';
import { toast } from 'sonner';
import { getFolderTemplate, updateFolderTemplate, initializeTenantFolders } from '../services/tenantSettingsService';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('organization');
  const [organizationName, setOrganizationName] = useState('Acme Construction');
  const [organizationLogo, setOrganizationLogo] = useState(null);
  const [defaultFolderTemplate, setDefaultFolderTemplate] = useState([
    {
      "id": "city",
      "name": "City",
      "children": [
        {
          "id": "community",
          "name": "Community",
          "children": [
            {
              "id": "lot-27",
              "name": "Lot 27",
              "children": [
                {
                  "id": "custom",
                  "name": "Custom",
                  "children": [
                    {
                      "id": "site-survey",
                      "name": "Site Survey",
                      "children": []
                    },
                    {
                      "id": "floor-plan",
                      "name": "Floor Plan",
                      "children": []
                    },
                    {
                      "id": "hvac",
                      "name": "HVAC",
                      "children": []
                    },
                    {
                      "id": "buyer-docs",
                      "name": "Buyer Docs",
                      "children": []
                    },
                    {
                      "id": "invoices",
                      "name": "Invoices",
                      "children": []
                    },
                    {
                      "id": "specifications",
                      "name": "Specifications",
                      "children": []
                    },
                    {
                      "id": "warranty",
                      "name": "Warranty",
                      "children": []
                    },
                    {
                      "id": "inspection-reports",
                      "name": "Inspection Reports",
                      "children": []
                    },
                    {
                      "id": "photos",
                      "name": "Photos",
                      "children": []
                    },
                    {
                      "id": "contracts",
                      "name": "Contracts",
                      "children": []
                    },
                    {
                      "id": "selections",
                      "name": "Selections",
                      "children": []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]);
  const [timezone, setTimezone] = useState('America/New_York');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAutoBackup, setEnableAutoBackup] = useState(true);
  const [deletedItemRetention, setDeletedItemRetention] = useState('forever');
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [currentTenantId, setCurrentTenantId] = useState(null);
  
  // In a real app, you would get the tenant ID from auth context or API
  // For now, we'll simulate getting it
  useEffect(() => {
    // This is a placeholder - in a real app you'd get this from your auth system
    // For demo purposes, we'll use a mock tenant ID
    setCurrentTenantId('mock-tenant-id');
  }, []);
  
  // Load folder template from API
  useEffect(() => {
    const loadFolderTemplate = async () => {
      if (!currentTenantId) return;
      
      try {
        setLoadingTemplate(true);
        const template = await getFolderTemplate(currentTenantId);
        setDefaultFolderTemplate(template);
      } catch (error) {
        console.error('Error loading folder template:', error);
        showErrorToast('Failed to load folder template');
      } finally {
        setLoadingTemplate(false);
      }
    };

    // Only load template when on the folder templates tab
    if (activeTab === 'folder-templates' && currentTenantId) {
      loadFolderTemplate();
    }
  }, [activeTab, currentTenantId]);

  // Load deleted item retention setting
  React.useEffect(() => {
    const savedRetention = getSetting('deletedItemRetention', 'forever');
    setDeletedItemRetention(savedRetention);
  }, []);

  const handleProjectLabelSave = (newLabel) => {
    // Toast notification is handled in the service file
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Save deleted item retention setting
    setSetting('deletedItemRetention', deletedItemRetention);
    
    // In a real app, this would save the other settings
    console.log('Saving settings:', {
      organizationName,
      organizationLogo,
      defaultFolderTemplate,
      timezone,
      enableNotifications,
      enableAutoBackup,
      deletedItemRetention
    });
    
    // Show a confirmation message
    toast.success('Settings saved successfully!');
  };

  const handleAddFolder = () => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: 'New Folder',
      children: []
    };
    
    // Add to root level
    setDefaultFolderTemplate(prev => [...prev, newFolder]);
  };

  const handleRemoveFolder = (folderId) => {
    const removeFolder = (folders) => {
      return folders.filter(folder => {
        if (folder.id === folderId) {
          return false;
        }
        if (folder.children && folder.children.length > 0) {
          folder.children = removeFolder(folder.children);
        }
        return true;
      });
    };
    
    setDefaultFolderTemplate(prev => removeFolder(prev));
  };

  const handleFolderNameChange = (folderId, newName) => {
    const updateFolderName = (folders) => {
      return folders.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, name: newName };
        }
        if (folder.children && folder.children.length > 0) {
          return { ...folder, children: updateFolderName(folder.children) };
        }
        return folder;
      });
    };
    
    setDefaultFolderTemplate(prev => updateFolderName(prev));
  };

  const handleSaveFolderTemplate = async () => {
    if (!currentTenantId) {
      showErrorToast('No tenant ID available');
      return;
    }
    
    try {
      await updateFolderTemplate(currentTenantId, defaultFolderTemplate);
      showSuccessToast('Folder template saved successfully');
    } catch (error) {
      console.error('Error saving folder template:', error);
      showErrorToast('Failed to save folder template');
    }
  };
  
  const handleInitializeFolders = async () => {
    if (!currentTenantId) {
      showErrorToast('No tenant ID available');
      return;
    }
    
    try {
      await initializeTenantFolders(currentTenantId);
      showSuccessToast('Folders initialized successfully');
    } catch (error) {
      console.error('Error initializing folders:', error);
      showErrorToast('Failed to initialize folders');
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOrganizationLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setOrganizationLogo(null);
    // Reset the file input
    const fileInput = document.getElementById('organization-logo-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Tab content components
  const OrganizationInfoTab = React.memo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text-primary">Organization Info</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label htmlFor="organization-name" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
              Organization Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="organization-name"
                id="organization-name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
              />
            </div>
          </div>

          {/* Organization Logo Upload */}
          <div className="sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700">
              Organization Logo
            </label>
            <div className="mt-1 flex items-center space-x-4">
              {/* Logo Preview */}
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center">
                  {organizationLogo ? (
                    <img 
                      src={organizationLogo} 
                      alt="Organization Logo" 
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <svg className="h-8 w-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Upload and Remove Buttons */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <input
                    type="file"
                    id="organization-logo-upload"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="organization-logo-upload"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent cursor-pointer dark:hover:bg-dark-bg-primary "
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Logo
                  </label>
                </div>
                
                {organizationLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:hover:bg-dark-bg-primary "
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  const FeatureSliderTab = React.memo(() => (
    <div className="space-y-6">
      <FeatureSliderManager />
    </div>
  ));

  const FolderItem = ({ folder, level = 0, onRemove, onNameChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(folder.name);
    
    const handleSave = () => {
      onNameChange(folder.id, editName);
      setIsEditing(false);
    };
    
    return (
      <div className="py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div style={{ width: `${level * 20}px` }}></div>
            <svg className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="ml-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent text-sm"
                autoFocus
              />
            ) : (
              <span 
                className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => {
                  setIsEditing(true);
                  setEditName(folder.name);
                }}
              >
                {folder.name}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onRemove(folder.id)}
            className="text-red-600 hover:text-red-900"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {folder.children && folder.children.length > 0 && (
          <div className="ml-6 border-l border-gray-200 pl-4">
            {folder.children.map((child) => (
              <FolderItem
                key={child.id}
                folder={child}
                level={level + 1}
                onRemove={onRemove}
                onNameChange={onNameChange}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const FolderTemplatesTab = React.memo(() => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text-primary">Default Folder Template</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleAddFolder}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            <svg className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Folder
          </button>
          <button
            type="button"
            onClick={handleSaveFolderTemplate}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Template
          </button>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          These folders will be created by default for new users. Folders follow the construction hierarchy: City → Community → Lot → Custom.
        </p>
      </div>
      <div className="mt-4 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto dark:bg-dark-bg-tertiary">
        {loadingTemplate ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          <div>
            {defaultFolderTemplate.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                onRemove={handleRemoveFolder}
                onNameChange={handleFolderNameChange}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
        <button
          type="button"
          onClick={handleInitializeFolders}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Initialize Folders for Current Tenant
        </button>
        <p className="mt-2 text-sm text-gray-500">
          Use this button to create the folder structure based on the template for the current tenant if folders don't exist.
        </p>
      </div>
    </div>
  ));

  const GlobalSettingsTab = React.memo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text-primary">Global Settings</h3>
        <div className="mt-4 space-y-6">
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
              Timezone
            </label>
            <div className="mt-1">
              <CustomSelect
                id="timezone"
                name="timezone"
                value={timezone}
                onChange={setTimezone}
                options={[
                  { value: 'America/New_York', label: 'Eastern Time (ET)' },
                  { value: 'America/Chicago', label: 'Central Time (CT)' },
                  { value: 'America/Denver', label: 'Mountain Time (MT)' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                  { value: 'Europe/London', label: 'London' },
                  { value: 'Asia/Tokyo', label: 'Tokyo' }
                ]}
                placeholder="Select timezone"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="enable-notifications" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                Enable Notifications
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Receive email notifications for important events.
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setEnableNotifications(!enableNotifications)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                  enableNotifications ? 'bg-accent' : 'bg-gray-200'
                }`}
                role="switch"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enableNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="enable-auto-backup" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                Enable Auto Backup
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Automatically backup data daily.
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setEnableAutoBackup(!enableAutoBackup)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                  enableAutoBackup ? 'bg-accent' : 'bg-gray-200'
                }`}
                role="switch"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enableAutoBackup ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  const RecycleBinTab = React.memo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text-primary">Recycle Bin Settings</h3>
        <div className="mt-4 space-y-6">
          <div>
            <label htmlFor="deleted-item-retention" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
              Deleted Item Retention Period
            </label>
            <div className="mt-1">
              <CustomSelect
                id="deleted-item-retention"
                name="deleted-item-retention"
                value={deletedItemRetention}
                onChange={setDeletedItemRetention}
                options={[
                  { value: 'forever', label: 'Forever' },
                  { value: '1-week', label: '1 Week' },
                  { value: '1-month', label: '1 Month' },
                  { value: '1-year', label: '1 Year' }
                ]}
                placeholder="Select retention period"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Items in the Recycle Bin will be automatically deleted after this period.
            </p>
          </div>
        </div>
      </div>
    </div>
  ));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'organization':
        return <OrganizationInfoTab />;
      case 'dashboard':
        return <DashboardTab onProjectLabelSave={handleProjectLabelSave} />;
      case 'feature-slider':
        return <FeatureSliderTab />;
      case 'folder-templates':
        return <FolderTemplatesTab />;
      case 'global':
        return <GlobalSettingsTab />;
      case 'recycle-bin':
        return <RecycleBinTab />;
      default:
        return <OrganizationInfoTab />;
    }
  };

  // Define tabs for navigation
  const tabs = [
    { id: 'organization', name: 'Organization Info' },
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'feature-slider', name: 'Feature Slider' },
    { id: 'folder-templates', name: 'Folder Templates' },
    { id: 'global', name: 'Global Settings' },
    { id: 'recycle-bin', name: 'Recycle Bin' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">Manage your organization settings and preferences.</p>
      </div>

      <div className="bg-white shadow sm:rounded-lg dark:bg-dark-bg-secondary">
        <div className="px-4 py-5 sm:p-6">
          {/* Tab Navigation - Horizontal for desktop, dropdown for mobile */}
          <div className="border-b border-gray-200 dark:border-dark-border">
            {/* Mobile dropdown selector */}
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">Select a tab</label>
              <select
                id="tabs"
                name="tabs"
                className="block w-full rounded-md border-gray-300 focus:border-accent focus:ring-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop horizontal tabs */}
            <div className="hidden sm:block">
              <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-accent text-accent dark:text-accent dark:border-accent'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-secondary dark:hover:text-dark-text-primary dark:hover:border-dark-border'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            <form onSubmit={handleSave} className="space-y-8">
              {renderTabContent()}

              {/* Action Buttons */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;