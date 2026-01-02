import React, { useState } from 'react';
import Thumbnail from './Thumbnail';
import ContextMenu from './ContextMenu'; // Import our new ContextMenu component
import Pagination from './Pagination';

const DocumentList = ({ 
  folders = [], 
  documents = [], 
  onSelectDocument, 
  onSelectFolder, 
  selectedDocument, 
  selectedFolder, 
  viewMode = 'list',
  onContextMenuAction, // Add this prop
  selectedItems = [],
  onItemSelect,
  onSelectAll,
  onDeselectAll,
  currentPage = 1,
  itemsPerPage = 20,
  onPageChange,
  searchTerm = '',
  fileType = '',
  dateRange = '',
  selectedTags = [],
  sortOption = 'relevance'
}) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });

  // Combine folders and documents into a single array with type information
  const getAllItems = () => {
    const folderItems = folders.map(folder => ({
      ...folder,
      type: 'folder',
      size: '-', // Folders don't have a size
      modified: '-' // Folders don't have a modified date in this mock data
    }));

    // Apply filters to documents
    let filteredDocuments = documents.filter(doc => !doc.deleted); // Filter out deleted documents
    
    // Apply search term filter
    if (searchTerm) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply file type filter
    if (fileType) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.type === fileType
      );
    }
    
    // Apply date range filter (simplified for mock data)
    if (dateRange) {
      // In a real app, this would filter by actual dates
      // For mock data, we'll just simulate some filtering
      if (dateRange === 'today') {
        // Filter for today's documents (mock implementation)
        filteredDocuments = filteredDocuments.filter((_, index) => index % 5 === 0);
      } else if (dateRange === 'week') {
        // Filter for this week's documents (mock implementation)
        filteredDocuments = filteredDocuments.filter((_, index) => index % 3 === 0);
      } else if (dateRange === 'month') {
        // Filter for this month's documents (mock implementation)
        filteredDocuments = filteredDocuments.filter((_, index) => index % 2 === 0);
      }
    }
    
    // Apply tags filter (simplified for mock data)
    if (selectedTags.length > 0) {
      // In a real app, this would filter by actual tags
      // For mock data, we'll just simulate some filtering
      filteredDocuments = filteredDocuments.filter((_, index) => index % 4 !== 0);
    }
    
    const documentItems = filteredDocuments.map(doc => ({
      ...doc,
      type: 'file'
    }));

    return [...folderItems, ...documentItems];
  };

  // Apply sorting
  const getSortedItems = () => {
    const items = getAllItems();
    
    // Apply sorting based on sortOption
    if (sortOption === 'latest') {
      return items.sort((a, b) => {
        // Sort folders first, then files
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        
        // Sort by modified date (newest first)
        return new Date(b.modified) - new Date(a.modified);
      });
    } else if (sortOption === 'oldest') {
      return items.sort((a, b) => {
        // Sort folders first, then files
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        
        // Sort by modified date (oldest first)
        return new Date(a.modified) - new Date(b.modified);
      });
    } else {
      // Default sorting (by name)
      return items.sort((a, b) => {
        // Sort folders first, then files
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        
        // Then sort by name
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    }
  };

  // Get paginated items
  const getPaginatedItems = () => {
    const allItems = getSortedItems();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allItems.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const totalPages = Math.ceil(getSortedItems().length / itemsPerPage);

  const sortedItems = getPaginatedItems();

  const handleRightClick = (e, item) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item: selectedItems.length > 1 ? { type: 'bulk', name: `${selectedItems.length} items` } : item
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, item: null });
  };

  const handleContextMenuItemClick = (action) => {
    // Pass the action and item to the parent component
    if (onContextMenuAction) {
      onContextMenuAction(action, contextMenu.item);
    }
    handleCloseContextMenu();
  };

  const getIcon = (item) => {
    if (item.type === 'folder') {
      return (
        <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
          <svg className="h-6 w-6 text-blue-800 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
      );
    }

    // File icons
    switch (item.icon) {
      case 'pdf':
        return (
          <div className="h-10 w-10 rounded-md bg-red-100 flex items-center justify-center dark:bg-red-900/30">
            <span className="text-red-800 font-bold text-xs dark:text-red-300">PDF</span>
          </div>
        );
      case 'doc':
        return (
          <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
            <span className="text-blue-800 font-bold text-xs dark:text-blue-300">DOC</span>
          </div>
        );
      case 'txt':
        return (
          <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center dark:bg-green-900/30">
            <span className="text-green-800 font-bold text-xs dark:text-green-300">TXT</span>
          </div>
        );
      case 'ppt':
        return (
          <div className="h-10 w-10 rounded-md bg-yellow-100 flex items-center justify-center dark:bg-yellow-900/30">
            <span className="text-yellow-800 font-bold text-xs dark:text-yellow-300">PPT</span>
          </div>
        );
      case 'xls':
        return (
          <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center dark:bg-green-900/30">
            <span className="text-green-800 font-bold text-xs dark:text-green-300">XLS</span>
          </div>
        );
      case 'ics':
        return (
          <div className="h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center dark:bg-purple-900/30">
            <span className="text-purple-800 font-bold text-xs dark:text-purple-300">ICS</span>
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center dark:bg-gray-700">
            <span className="text-gray-800 font-bold text-xs dark:text-gray-300">FILE</span>
          </div>
        );
    }
  };

  // Render list view
  const renderListView = () => (
    <div className="h-full flex flex-col">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-secondary">
        <div className="col-span-5 flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent dark:bg-dark-bg-secondary dark:border-dark-border"
            checked={selectedItems.length > 0 && selectedItems.length === sortedItems.length}
            onChange={(e) => {
              if (e.target.checked) {
                onSelectAll();
              } else {
                onDeselectAll();
              }
            }}
          />
          <span className="ml-2">
            Name
          </span>
        </div>
        <div className="col-span-2 flex items-center">
          <span>Size</span>
        </div>
        <div className="col-span-2 flex items-center">
          <span>Type</span>
        </div>
        <div className="col-span-3 flex items-center">
          <span>Date Modified</span>
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto">
        {sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <svg className="h-12 w-12 text-gray-400 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">No items</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">This folder is empty.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-dark-border">
            {sortedItems.map((item) => (
              <li
                key={item.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer dark:hover:bg-dark-bg-primary ${
                  (item.type === 'file' && selectedDocument && selectedDocument.id === item.id) ||
                  (item.type === 'folder' && selectedFolder && selectedFolder === item.id) ||
                  selectedItems.some(selectedItem => selectedItem.id === item.id)
                    ? 'bg-accent-light dark:bg-accent-dark' : ''
                }`}
                onClick={(e) => {
                  if (e.target.type !== 'checkbox') {
                    if (item.type === 'folder') {
                      onSelectFolder(item);
                    } else {
                      onSelectDocument(item);
                    }
                  }
                  onItemSelect(item, e);
                }}
                onContextMenu={(e) => handleRightClick(e, item)}
              >
                <div className="col-span-5 flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent dark:bg-dark-bg-secondary dark:border-dark-border"
                    checked={selectedItems.some(selectedItem => selectedItem.id === item.id)}
                    onChange={() => {}} // Handled by onClick
                  />
                  <div className="ml-3">
                    {getIcon(item)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">{item.name}</div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center text-sm text-gray-500 dark:text-dark-text-secondary">
                  {item.size}
                </div>
                <div className="col-span-2 flex items-center text-sm text-gray-500 dark:text-dark-text-secondary">
                  {item.type === 'folder' ? 'Folder' : item.type}
                </div>
                <div className="col-span-3 flex items-center text-sm text-gray-500 dark:text-dark-text-secondary">
                  {item.modified}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        item={contextMenu.item}
        onItemClick={handleContextMenuItemClick}
        onClose={handleCloseContextMenu}
      />
    </div>
  );

  // Render thumbnail view
  const renderThumbnailView = () => (
    <div className="h-full flex flex-col">
      {/* Document thumbnails grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <svg className="h-12 w-12 text-gray-400 dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">No items</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">This folder is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedItems.map((item) => (
              <div key={item.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute top-2 left-2 z-10 h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent dark:bg-dark-bg-secondary dark:border-dark-border"
                  checked={selectedItems.some(selectedItem => selectedItem.id === item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onItemSelect(item, e);
                  }}
                />
                <Thumbnail
                  item={item}
                  onSelectFolder={onSelectFolder}
                  onSelectDocument={onSelectDocument}
                  onRightClick={(e) => handleRightClick(e, item)}
                  isSelected={
                    (item.type === 'file' && selectedDocument && selectedDocument.id === item.id) ||
                    (item.type === 'folder' && selectedFolder && selectedFolder === item.id) ||
                    selectedItems.some(selectedItem => selectedItem.id === item.id)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        item={contextMenu.item}
        onItemClick={handleContextMenuItemClick}
        onClose={handleCloseContextMenu}
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {viewMode === 'thumbnail' ? renderThumbnailView() : renderListView()}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          totalItems={getAllItems().length}
        />
      )}
    </div>
  );
};

export default DocumentList;