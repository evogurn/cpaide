import React, { useState } from 'react';
import DocumentHistory from '../components/DocumentHistory';
import LoginHistory from '../components/LoginHistory';

const History = () => {
  const [activeTab, setActiveTab] = useState('document-history');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">History</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
          View document interactions and user login activity
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('document-history')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'document-history'
                ? 'border-accent text-accent dark:text-accent-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-secondary dark:hover:text-dark-text-primary dark:hover:border-dark-border'
            }`}
          >
            Document History
          </button>
          <button
            onClick={() => setActiveTab('login-history')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'login-history'
                ? 'border-accent text-accent dark:text-accent-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-text-secondary dark:hover:text-dark-text-primary dark:hover:border-dark-border'
            }`}
          >
            Login History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'document-history' && <DocumentHistory />}
        {activeTab === 'login-history' && <LoginHistory />}
      </div>
    </div>
  );
};

export default History;