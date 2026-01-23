import React, { useState } from 'react';
import CustomSelect from '../components/CustomSelect';
import FeatureSliderManager from '../components/FeatureSliderManager';
import DashboardTab from './Settings/DashboardTab';
import BillingTab from './Settings/BillingTab';
import FolderTemplateSelector from '../components/FolderTemplateSelector';
import { getSetting, setSetting } from '../utils/settingsUtils';
import { toast } from 'sonner';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('organization');
  const [organizationName, setOrganizationName] = useState('Acme Construction');
  const [organizationLogo, setOrganizationLogo] = useState(null);
  const [timezone, setTimezone] = useState('America/New_York');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAutoBackup, setEnableAutoBackup] = useState(true);
  const [deletedItemRetention, setDeletedItemRetention] = useState('forever');
  
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
      timezone,
      enableNotifications,
      enableAutoBackup,
      deletedItemRetention
    });
    
    // Show a confirmation message
    toast.success('Settings saved successfully!');
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

  const FolderTemplatesTab = React.memo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text-primary">Folder Templates</h3>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Select and apply a folder template to automatically create a hierarchical folder structure for your organization.
          </p>
        </div>
        <div className="mt-6">
          <FolderTemplateSelector onApplyTemplate={(template) => {
            toast.success(`Template "${template.name}" applied successfully!`);
          }} />
        </div>
      </div>
    </div>
  ));

  const GlobalSettingsTab = React.memo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text-primary">Global Options</h3>
        <div className="mt-4 space-y-6">
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <div className="mt-1">
              <CustomSelect
                id="timezone"
                name="timezone"
                value={timezone}
                onChange={setTimezone}
                options={[
                  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
                  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
                  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
                  { value: 'Europe/London', label: 'London' },
                  { value: 'Europe/Paris', label: 'Paris' },
                  { value: 'Asia/Tokyo', label: 'Tokyo' },
                  { value: 'Australia/Sydney', label: 'Sydney' }
                ]}
                placeholder="Select timezone"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="notifications"
              name="notifications"
              type="checkbox"
              checked={enableNotifications}
              onChange={(e) => setEnableNotifications(e.target.checked)}
              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            />
            <label htmlFor="notifications" className="ml-3 block text-sm font-medium text-gray-700">
              Enable email notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="auto-backup"
              name="auto-backup"
              type="checkbox"
              checked={enableAutoBackup}
              onChange={(e) => setEnableAutoBackup(e.target.checked)}
              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            />
            <label htmlFor="auto-backup" className="ml-3 block text-sm font-medium text-gray-700">
              Enable automatic backups
            </label>
          </div>
          
          {/* Deleted Item Retention */}
          <div>
            <label htmlFor="deleted-item-retention" className="block text-sm font-medium text-gray-700">
              How long to keep deleted items
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

  const RecycleBinTab = React.memo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text-primary">Recycle Bin Settings</h3>
        <div className="mt-4">
          <label htmlFor="deleted-item-retention" className="block text-sm font-medium text-gray-700">
            How long to keep deleted items
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
      case 'billing':
        return <BillingTab />;
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
    { id: 'recycle-bin', name: 'Recycle Bin' },
    { id: 'billing', name: 'Billing' }
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
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
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