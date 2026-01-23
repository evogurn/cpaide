import React from 'react';

const MobileFolderDrawer = ({ isOpen, onClose, folders, selectedFolder, onSelectFolder }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute top-0 left-0 h-full w-64 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0 dark:bg-dark-bg-secondary">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">Folders</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-accent text-accent-contrast'
                      : 'hover:bg-gray-100 dark:hover:bg-dark-bg-primary text-gray-900 dark:text-dark-text-primary'
                  }`}
                  onClick={() => {
                    onSelectFolder(folder.id);
                    onClose();
                  }}
                >
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-500 dark:text-dark-text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <span className="ml-3 truncate text-sm font-medium">{folder.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFolderDrawer;