import React, { useState } from 'react';
import useLongPress from '../hooks/useLongPress';
import { getIconType, getFileIcon } from '../utils/fileIcons.jsx';

const MobileFileCard = ({ 
  item, 
  isSelected, 
  onSelect, 
  onContextMenu, 
  onSelectDocument, 
  onSelectFolder 
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = (e) => {
    if (onSelect) {
      onSelect(item, e);
    }
  };

  const handleItemPress = (e) => {
    if (item.type === 'folder') {
      onSelectFolder(item);
    } else {
      onSelectDocument(item);
    }
  };

  const longPressProps = useLongPress(handleLongPress, handleItemPress);

  const getIcon = () => {
    if (item.type === 'folder') {
      return (
        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
          <svg className="h-6 w-6 text-blue-800 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
      );
    }

    // Determine icon type from MIME type or file extension
    const iconType = getIconType(item.mimeType, item.name);
    
    return getFileIcon(iconType, true, 'h-10 w-10');
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e, item);
  };

  return (
    <div
      className={`flex items-center p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow min-h-[56px] ${
        isSelected ? 'bg-gray-50 border-gray-400 dark:bg-dark-bg-tertiary dark:border-gray-500' : 'border-gray-200 dark:border-dark-border dark:bg-dark-bg-primary'
      }`}
      {...longPressProps}
      onContextMenu={handleContextMenu}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleItemPress(e);
        }
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-500 dark:bg-dark-bg-secondary dark:border-dark-border mr-3"
          checked={isSelected}
          onChange={(e) => {
            onSelect(item, e);
          }}
        />
      </div>
      
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg mr-3">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        {/* <div className="flex items-center text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
          <span>{item.size}</span>
          {item.type !== 'folder' && (
            <>
              <span className="mx-1">•</span>
              <span>{item.type}</span>
            </>
          )}
          <span className="mx-1">•</span>
          <span>{item.modified}</span>
        </div> */}
      </div>
      
      <button
        className="ml-2 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          handleContextMenu(e);
        }}
        aria-label="More options"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  );
};

export default MobileFileCard;