import React, { useState } from 'react';
import useLongPress from '../hooks/useLongPress';
import { getIconType, getFileIcon } from '../utils/fileIcons.jsx';

const Thumbnail = ({ 
  item, 
  onSelectFolder, 
  onSelectDocument, 
  onRightClick, 
  isSelected,
  onSelect,
  isOpen
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = (e) => {
    if (onSelect) {
      onSelect(item, e);
    }
  };

  const handleClick = (e) => {
    // If it's a mobile device and we are in "selection mode" (some items already selected),
    // then click should toggle selection instead of opening.
    // However, the user specifically asked for long press to select.
    
    // For simplicity, let's stick to: click opens, long press selects on mobile.
    // On desktop, click opens, checkbox selects.
    
    if (item.type === 'folder') {
      onSelectFolder(item);
    } else {
      onSelectDocument(item);
    }
  };

  const longPressProps = useLongPress(handleLongPress, handleClick);

  const getIcon = () => {
    const iconBaseClass = "h-20 w-20 rounded-xl flex items-center justify-center relative transition-all duration-200 group-hover:scale-105";
    
    let iconContent;
    if (item.type === 'folder') {
      iconContent = (
        <div className={`${iconBaseClass} bg-blue-50 dark:bg-blue-900/20`}>
          <svg className="h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
      );
    } else {
      // Determine icon type from MIME type or file extension
      const iconType = getIconType(item.mimeType, item.name);
      
      iconContent = (
        <div className={iconBaseClass}>
          {getFileIcon(iconType, true, 'h-20 w-20')}
        </div>
      );
    }

    return (
      <div className="relative group">
        {iconContent}
        
        {/* Checkbox overlay on the icon */}
        <div 
          className={`absolute top-1 left-1 z-10 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="h-5 w-5 rounded-full border-gray-300 text-gray-700 focus:ring-gray-500 cursor-pointer dark:bg-dark-bg-secondary dark:border-dark-border"
            checked={isSelected}
            onChange={(e) => {
              onSelect(item, e);
            }}
          />
        </div>

        {/* Selection highlight overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-gray-900/10 dark:bg-white/5 rounded-xl pointer-events-none"></div>
        )}
      </div>
    );
  };

  return (
    <div
      className="flex flex-col items-center p-2 cursor-pointer transition-all duration-200 rounded-xl"
      {...longPressProps}
      onContextMenu={onRightClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {getIcon()}
      <div className="mt-3 text-center w-full max-w-[100px]">
        <p className="text-sm font-medium text-gray-900 truncate dark:text-dark-text-primary" title={item.name}>
          {item.name}
        </p>
        {item.type === 'file' && (
          <p className="text-xs text-gray-500 dark:text-dark-text-secondary truncate" title={item.size}>
            {item.size}
          </p>
        )}
      </div>

      {/* Action buttons on hover */}
      {showActions && !isSelected && (
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            className="p-1.5 rounded-full bg-white/90 shadow-sm text-gray-600 hover:text-gray-900 dark:bg-dark-bg-secondary/90 dark:text-dark-text-secondary dark:hover:text-dark-text-primary backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
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