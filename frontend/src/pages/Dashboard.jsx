import React, { useState } from 'react';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import { useProjectLabel } from '../services/projectLabelService';
import { metrics as mockMetrics, recentDocuments } from '../data/index';

const Dashboard = () => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Use the project label hook instead of localStorage
  const { data: projectLabel = 'Total Projects', isLoading, isError } = useProjectLabel();

  // Use imported metrics data
  const metrics = mockMetrics.map(metric => 
    metric.name === 'Total Projects' ? {...metric, name: projectLabel} : metric
  );

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setPreviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">Welcome back! Here's what's happening with your construction projects today.</p>
      </div>

      {/* Metrics cards - now only 3 cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white overflow-hidden shadow rounded-lg dark:bg-dark-bg-secondary dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.3)]">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-accent rounded-md p-3">
                  <svg className="h-6 w-6 text-accent-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-dark-text-secondary">{metric.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">{metric.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'} ${metric.changeType === 'positive' ? 'dark:text-green-400' : 'dark:text-red-400'}`}>
                        {metric.changeType === 'positive' ? (
                          <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="self-center flex-shrink-0 h-5 w-5 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {metric.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent documents - now full width */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg dark:bg-dark-bg-secondary dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.3)]">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary">Recent Documents</h3>
            <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-accent-contrast bg-accent-light hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-accent-dark dark:hover:bg-accent">
              View all
            </button>
          </div>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-dark-border">
          {recentDocuments.map((document) => (
            <li key={document.id} onClick={() => handleDocumentClick(document)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg-primary">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {document.icon === 'pdf' ? (
                        <div className="h-10 w-10 rounded-md bg-red-100 flex items-center justify-center dark:bg-red-900/30">
                          <span className="text-red-800 font-bold text-xs dark:text-red-300">PDF</span>
                        </div>
                      ) : document.icon === 'doc' ? (
                        <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                          <span className="text-blue-800 font-bold text-xs dark:text-blue-300">DWG</span>
                        </div>
                      ) : document.icon === 'txt' ? (
                        <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                          <span className="text-green-800 font-bold text-xs dark:text-green-300">TXT</span>
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-yellow-100 flex items-center justify-center dark:bg-yellow-900/30">
                          <span className="text-yellow-800 font-bold text-xs dark:text-yellow-300">FILE</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">{document.name}</div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-dark-text-secondary">
                        <span>{document.type}</span>
                        <span className="mx-2">•</span>
                        <span>{document.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    {document.date}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Document Preview Modal */}
      {previewModalOpen && (
        <DocumentPreviewModal 
          document={selectedDocument} 
          onClose={() => setPreviewModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;