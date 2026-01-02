import React, { useState } from 'react';

const FolderItem = ({ folder, selectedFolder, onSelectFolder, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = folder.id === selectedFolder;
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center py-2 px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg-primary  ${
          isSelected ? 'bg-accent-light border-l-4 border-accent' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 16}px` }}
        onClick={() => onSelectFolder(folder.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className={`h-4 w-4 transform transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {!hasChildren && <div className="w-6 mr-2"></div>}
        <svg
          className="flex-shrink-0 h-5 w-5 text-gray-500"
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
        <span className="ml-2 text-sm font-medium text-gray-700 truncate">{folder.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              selectedFolder={selectedFolder}
              onSelectFolder={onSelectFolder}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTree = ({ folders, selectedFolder, onSelectFolder }) => {
  return (
    <div className="py-2">
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          selectedFolder={selectedFolder}
          onSelectFolder={onSelectFolder}
        />
      ))}
    </div>
  );
};

export default FolderTree;