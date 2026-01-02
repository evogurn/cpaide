import React, { useState } from 'react';

const Thumbnail = ({ item, onSelectFolder, onSelectDocument, onRightClick, isSelected }) => {
  const [showActions, setShowActions] = useState(false);

  const getIcon = () => {
    if (item.type === 'folder') {
      return (
        <div className="h-16 w-16 rounded-md bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
          <svg className="h-8 w-8 text-blue-800 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
      );
    }

    // File icons
    switch (item.icon) {
      case 'pdf':
        return (
          <div className="h-16 w-16 rounded-md bg-red-100 flex items-center justify-center dark:bg-red-900/30">
            <span className="text-red-800 font-bold text-xs dark:text-red-300">PDF</span>
          </div>
        );
      case 'doc':
        return (
          <div className="h-16 w-16 rounded-md bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
            <span className="text-blue-800 font-bold text-xs dark:text-blue-300">DOC</span>
          </div>
        );
      case 'txt':
        return (
          <div className="h-16 w-16 rounded-md bg-green-100 flex items-center justify-center dark:bg-green-900/30">
            <span className="text-green-800 font-bold text-xs dark:text-green-300">TXT</span>
          </div>
        );
      case 'ppt':
        return (
          <div className="h-16 w-16 rounded-md bg-yellow-100 flex items-center justify-center dark:bg-yellow-900/30">
            <span className="text-yellow-800 font-bold text-xs dark:text-yellow-300">PPT</span>
          </div>
        );
      case 'xls':
        return (
          <div className="h-16 w-16 rounded-md bg-green-100 flex items-center justify-center dark:bg-green-900/30">
            <span className="text-green-800 font-bold text-xs dark:text-green-300">XLS</span>
          </div>
        );
      case 'ics':
        return (
          <div className="h-16 w-16 rounded-md bg-purple-100 flex items-center justify-center dark:bg-purple-900/30">
            <span className="text-purple-800 font-bold text-xs dark:text-purple-300">ICS</span>
          </div>
        );
      default:
        return (
          <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center dark:bg-gray-700">
            <span className="text-gray-800 font-bold text-xs dark:text-gray-300">FILE</span>
          </div>
        );
    }
  };

  const handleItemClick = (e) => {
    // Don't trigger item click if clicking on checkbox
    if (e.target.type === 'checkbox') {
      return;
    }
    
    if (item.type === 'folder') {
      onSelectFolder(item);
    } else {
      onSelectDocument(item);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    // Handle checkbox selection logic in parent component
  };

  return (
    <div
      className={`rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-accent bg-accent-light dark:bg-accent-dark' 
          : 'border-transparent hover:border-gray-300 dark:hover:border-dark-border'
      }`}
      onClick={handleItemClick}
      onContextMenu={onRightClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex flex-col items-center">
        {getIcon()}
        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-gray-900 break-words w-full dark:text-dark-text-primary">
            {item.name}
          </p>
          {item.type === 'file' && (
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
              {item.size}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons on hover */}
      {showActions && (
        <div className="absolute top-1 right-1 flex space-x-1">
          <button
            className="p-1 rounded-full bg-white shadow-sm text-gray-600 hover:text-gray-900 dark:bg-dark-bg-secondary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
            onClick={(e) => {
              e.stopPropagation();
              // Trigger the same context menu that appears on right-click
              onRightClick(e);
            }}
            aria-label="More actions"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Thumbnail;