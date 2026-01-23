import React, { useState } from 'react';

const AdminSettings = () => {
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    systemNotifications: true,
    backupEnabled: true,
    logRetention: 30
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'admin@cpaide.com',
    fromName: 'CPAide Admin'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordComplexity: 'high',
    sessionTimeout: 60,
    maxLoginAttempts: 5
  });

  const handleSystemSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmailSettingsChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSecuritySettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would save the settings to the backend
    console.log('Settings saved:', { systemSettings, emailSettings, securitySettings });
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
          System Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
          Configure system-wide settings for the application
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* System Settings Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">
              System Configuration
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Maintenance Mode
                  </label>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Enable maintenance mode to temporarily disable the application for regular users
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={systemSettings.maintenanceMode}
                    onChange={handleSystemSettingsChange}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded dark:bg-dark-bg-tertiary dark:border-dark-border"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    System Notifications
                  </label>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Enable system-wide notifications
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="systemNotifications"
                    checked={systemSettings.systemNotifications}
                    onChange={handleSystemSettingsChange}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded dark:bg-dark-bg-tertiary dark:border-dark-border"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Automated Backups
                  </label>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Enable automated system backups
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="backupEnabled"
                    checked={systemSettings.backupEnabled}
                    onChange={handleSystemSettingsChange}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded dark:bg-dark-bg-tertiary dark:border-dark-border"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  Log Retention (days)
                </label>
                <input
                  type="number"
                  name="logRetention"
                  value={systemSettings.logRetention}
                  onChange={handleSystemSettingsChange}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email Settings Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">
              Email Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  name="smtpHost"
                  value={emailSettings.smtpHost}
                  onChange={handleEmailSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  name="smtpPort"
                  value={emailSettings.smtpPort}
                  onChange={handleEmailSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  name="smtpUser"
                  value={emailSettings.smtpUser}
                  onChange={handleEmailSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  SMTP Password
                </label>
                <input
                  type="password"
                  name="smtpPassword"
                  value={emailSettings.smtpPassword}
                  onChange={handleEmailSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  name="fromEmail"
                  value={emailSettings.fromEmail}
                  onChange={handleEmailSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  name="fromName"
                  value={emailSettings.fromName}
                  onChange={handleEmailSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-bg-primary rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">
              Security Configuration
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    Two-Factor Authentication
                  </label>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Require two-factor authentication for all users
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onChange={handleSecuritySettingsChange}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded dark:bg-dark-bg-tertiary dark:border-dark-border"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  Password Complexity
                </label>
                <select
                  name="passwordComplexity"
                  value={securitySettings.passwordComplexity}
                  onChange={handleSecuritySettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                >
                  <option value="low">Low (8+ characters)</option>
                  <option value="medium">Medium (8+ characters, 1 number, 1 symbol)</option>
                  <option value="high">High (8+ characters, uppercase, lowercase, number, symbol)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={securitySettings.sessionTimeout}
                  onChange={handleSecuritySettingsChange}
                  min="15"
                  max="240"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  name="maxLoginAttempts"
                  value={securitySettings.maxLoginAttempts}
                  onChange={handleSecuritySettingsChange}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-accent hover:bg-accent-dark text-accent-contrast px-4 py-2 rounded-md text-sm font-medium"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;