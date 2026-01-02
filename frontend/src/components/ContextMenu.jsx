import React, { useState, useEffect, useRef } from 'react';

const ContextMenu = ({ 
  visible, 
  x, 
  y, 
  item, 
  onItemClick,
  onClose 
}) => {
  const menuRef = useRef(null);

  // Handle clicks outside the context menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!visible) return;
      
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible || !item) return null;

  // Define menu items based on item type
  const getMenuItems = () => {
    // Check if this is a bulk action context menu (indicated by item.type === 'bulk')
    if (item.type === 'bulk') {
      return [
        { id: 'bulk-move', label: 'Move Selected', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
        { id: 'bulk-delete', label: 'Delete Selected', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' }
      ];
    }
    
    const baseItems = [
      { id: 'open', label: 'Open', icon: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' },
      { id: 'rename', label: 'Rename', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
      { id: 'delete', label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
      { id: 'move', label: 'Move', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' }
    ];

    // Add download option for files
    if (item.type === 'file') {
      baseItems.splice(4, 0, { 
        id: 'download', 
        label: 'Download', 
        icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' 
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      <div
        ref={menuRef}
        className="absolute z-50 bg-white shadow-lg rounded-md py-1 w-48 dark:bg-dark-bg-secondary dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-dark-border"
        style={{ top: y, left: x }}
        role="menu"
        aria-label="Context menu"
      >
        {menuItems.map((menuItem) => (
          <button
            key={menuItem.id}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-accent-light dark:text-dark-text-primary dark:hover:bg-accent-dark focus:outline-none focus:bg-accent-light dark:focus:bg-accent-dark"
            onClick={() => onItemClick(menuItem.id)}
            role="menuitem"
          >
            <svg 
              className="h-4 w-4 mr-2 text-gray-500 dark:text-dark-text-secondary" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuItem.icon} />
            </svg>
            {menuItem.label}
          </button>
        ))}
      </div>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
    </>
  );
};

export default ContextMenu;