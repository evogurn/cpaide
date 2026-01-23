import React, { useState, useRef, useEffect } from 'react';
import { useFolderTree, useCreateFolder, useRenameFolder, useDeleteFolder, useMoveFolder } from '../hooks/useFolderTree';
import { useDocumentsByFolder } from '../hooks/useDocumentsByFolder';
import { useRenameDocument, useDeleteDocument, useMoveDocument, useDownloadDocument } from '../hooks/useDocumentOperations';
import { useUploadDocument } from '../hooks/useUploadDocument';
import usePopoverPosition from '../hooks/usePopoverPosition';
import Breadcrumb from '../components/Breadcrumb';
import FolderTree from '../components/FolderTree';
import DocumentList from '../components/DocumentList';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import NewFolderModal from '../components/NewFolderModal';
import UploadModal from '../components/UploadModal';
import RenameModal from '../components/RenameModal';
import MoveModal from '../components/MoveModal';
import BulkActionToolbar from '../components/BulkActionToolbar';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import CustomSelect from '../components/CustomSelect';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileFolderDrawer from '../components/MobileFolderDrawer';
import MobileFileCard from '../components/MobileFileCard';
import ContextMenu from '../components/ContextMenu';
import { documentTags, documentHistory as mockDocumentHistory } from '../data/index';

const DocumentExplorer = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]); // Multi-selection state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [folderTreeCollapsed, setFolderTreeCollapsed] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contextMenuItem, setContextMenuItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState('relevance');
  const [viewMode, setViewMode] = useState(() => {
    // Get view mode from localStorage or default to 'list'
    return localStorage.getItem('documentExplorerViewMode') || 'list';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Items per page for pagination
  const [mobileBottomNavActive, setMobileBottomNavActive] = useState('home');
  const [showMobileFolderDrawer, setShowMobileFolderDrawer] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });
  
  const filterButtonRef = useRef(null);
  const filterPopoverRef = useRef(null);

  // Use API to fetch folder tree
  const { data: folders = [], isLoading: foldersLoading, isError: foldersError } = useFolderTree();
  
  // Set initial selected folder to the root folder (using null or a specific root ID)
  const [selectedFolder, setSelectedFolder] = useState(null); // Use null to represent root folder
  
  // Initialize expanded folders - expand root by default
  const [expandedFolders, setExpandedFolders] = useState(() => {
    const initialExpanded = new Set();
    // Root is always "expanded" since it's the default view
    return initialExpanded;
  });

  // Fetch documents for the selected folder
  const { data: folderDocuments = [], isLoading: documentsLoading, isError: documentsError } = useDocumentsByFolder(selectedFolder);

  // Use imported document history
  const [documentHistory, setDocumentHistory] = useState(mockDocumentHistory);

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('documentExplorerViewMode', viewMode);
  }, [viewMode]);

  // Use custom hook for popover positioning
  const filterPopoverPosition = usePopoverPosition(filterButtonRef, filterPopoverRef, showFilters);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(event.target) &&
          filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getBreadcrumbPath = () => {
    if (selectedFolder === null) {
      // For root folder, return a root path element
      return [{ id: null, name: 'Root', path: '/' }];
    }
    
    const path = [];
    let currentFolderId = selectedFolder;
    
    // Find the folder and build path upward
    const findFolder = (folderList, targetId) => {
      for (const folder of folderList) {
        if (folder.id === targetId) {
          path.unshift(folder);
          return true;
        }
        if (folder.children && findFolder(folder.children, targetId)) {
          path.unshift(folder);
          return true;
        }
      }
      return false;
    };
    
    findFolder(folders, currentFolderId);
    return path;
  };

  // Helper function to find a folder by ID
  const findFolderById = (folderList, targetId) => {
    for (const folder of folderList) {
      if (folder.id === targetId) {
        return folder;
      }
      if (folder.children) {
        const found = findFolderById(folder.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper function to update folder structure
  const updateFolderStructure = (folderList, targetId, updater) => {
    return folderList.map(folder => {
      if (folder.id === targetId) {
        return updater(folder);
      }
      if (folder.children) {
        return {
          ...folder,
          children: updateFolderStructure(folder.children, targetId, updater)
        };
      }
      return folder;
    });
  };

  // Get child folders of the selected folder
  const getChildFolders = () => {
    if (selectedFolder === null) {
      // Return root level folders
      return folders;
    }
    const selectedFolderObj = findFolderById(folders, selectedFolder);
    return selectedFolderObj ? selectedFolderObj.children || [] : [];
  };

  const handleFolderSelect = (folderId) => {
    setSelectedFolder(folderId);
    // Reset selected document when folder changes
    setSelectedDocument(null);
    // Reset pagination when folder changes
    setCurrentPage(1);
    // Clear selection when folder changes
    setSelectedItems([]);
  };
  
  const handleToggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleFolderItemClick = (folder) => {
    handleFolderSelect(folder.id);
  };

  // Multi-selection handlers
  const handleItemSelect = (item, event) => {
    // Check if the click was on a checkbox, or if it's a toggle-intent click
    const isCheckbox = event && event.target && (event.target.type === 'checkbox' || event.target.tagName === 'INPUT');
    const isItemAlreadySelected = selectedItems.some(selectedItem => selectedItem.id === item.id);

    // Toggle selection if:
    // 1. Ctrl/Cmd key is pressed
    // 2. It's a checkbox click
    // 3. The item is already selected (this handles the "re-click unchecks" case)
    if (event?.ctrlKey || event?.metaKey || isCheckbox || (isItemAlreadySelected && !event?.shiftKey)) {
      if (isItemAlreadySelected) {
        // Remove from selection (Uncheck)
        setSelectedItems(prev => prev.filter(selectedItem => selectedItem.id !== item.id));
      } else {
        // Add to selection (Multi-select)
        setSelectedItems(prev => [...prev, item]);
      }
    }
    // If Shift key is pressed, select range
    else if (event?.shiftKey) {
      // Get all items in current view
      const allItems = [...getChildFolders().map(folder => ({...folder, type: 'folder'})), 
                       ...(docs[selectedFolder] || []).map(doc => ({...doc, type: 'file'}))];
      
      // Find indices of last selected item and current item
      const lastIndex = selectedItems.length > 0 ? 
        allItems.findIndex(i => i.id === selectedItems[selectedItems.length - 1].id) : 0;
      const currentIndex = allItems.findIndex(i => i.id === item.id);
      
      // Select range between last selected and current
      const startIndex = Math.min(lastIndex, currentIndex);
      const endIndex = Math.max(lastIndex, currentIndex);
      
      // Create a new selection with the range
      const rangeSelection = [];
      for (let i = startIndex; i <= endIndex; i++) {
        rangeSelection.push(allItems[i]);
      }
      
      // Combine existing selections with range selection, removing duplicates
      const combinedSelection = [...selectedItems];
      rangeSelection.forEach(rangeItem => {
        if (!combinedSelection.some(selectedItem => selectedItem.id === rangeItem.id)) {
          combinedSelection.push(rangeItem);
        }
      });
      
      setSelectedItems(combinedSelection);
    }
    // Otherwise, single selection
    else {
      setSelectedItems([item]);
    }
  };

  const handleSelectAll = () => {
    // Get all items in current view
    const allItems = [...getChildFolders().map(folder => ({...folder, type: 'folder'})), 
                     ...(docs[selectedFolder] || []).map(doc => ({...doc, type: 'file'}))];
    setSelectedItems(allItems);
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  const { mutate: createFolder, isLoading: isCreatingFolder } = useCreateFolder();
  const { mutate: renameFolder, isPending: isRenamingFolder } = useRenameFolder();
  const { mutate: deleteFolder, isPending: isDeletingFolder } = useDeleteFolder();
  const { mutate: moveFolder, isPending: isMovingFolder } = useMoveFolder();
  const { mutate: renameDocument, isPending: isRenamingDocument } = useRenameDocument();
  const { mutate: deleteDocument, isPending: isDeletingDocument } = useDeleteDocument();
  const { mutate: moveDocument, isPending: isMovingDocument } = useMoveDocument();
  const { mutate: downloadDocument } = useDownloadDocument();
  const { mutate: uploadDocument, isLoading: isUploading } = useUploadDocument();

  const handleCreateFolder = (newFolderName, parentFolderId) => {
    const folderData = {
      name: newFolderName,
      parentId: parentFolderId === 'root' ? null : parentFolderId, // Handle root case
    };
    
    createFolder(folderData, {
      onSuccess: (newFolder) => {
        // The hook will automatically refetch the folder tree
        setShowNewFolderModal(false);
      },
      onError: (error) => {
        console.error('Error creating folder:', error);
        // Show error to user
      }
    });
  };

  const handleFileUpload = ({ file, title, description, tags, folderId }) => {
    // Use the uploadDocument mutation from the hook
    uploadDocument({
      file,
      title,
      description,
      tags,
      folderId
    }, {
      onError: (error) => {
        console.error('Error uploading document:', error);
        // In a real app, you'd want to show an error message to the user
        alert('Failed to upload document: ' + error.message);
      }
    });
  };

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    // In a real app, this would filter the documents
    console.log('Applying filters:', { searchTerm, fileType, dateRange, selectedTags, sortOption });
    setShowFilters(false);
    // Reset pagination when filters are applied
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFileType('');
    setDateRange('');
    setSelectedTags([]);
    setSortOption('relevance');
    // Reset pagination when filters are cleared
    setCurrentPage(1);
  };

  // Handle context menu item clicks for empty area
  const handleContextMenuItemClick = (action) => {
    setContextMenu({ visible: false, x: 0, y: 0, item: null });
    
    switch (action) {
      case 'upload':
        setShowUploadModal(true);
        break;
      case 'create-folder':
        setShowNewFolderModal(true);
        break;
      default:
        // Handle other actions if needed
        break;
    }
  };

  // Context menu actions
  const handleContextMenuAction = (e, item) => {
    // If e is an event object (right-click), handle context menu positioning
    if (e && e.preventDefault) {
      e.preventDefault();
      
      // For empty area right-click, show context menu with options for current folder
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        item: { type: 'empty-area', folderId: selectedFolder, name: 'Empty Area' }
      });
    } else {
      // If e is an action string (from existing code), handle it as before
      const action = e;
      setContextMenuItem(item);
      
      switch (action) {
        case 'open':
          if (item.type === 'folder') {
            handleFolderSelect(item.id);
          } else {
            handleDocumentSelect(item);
          }
          break;
        case 'rename':
          setShowRenameModal(true);
          break;
        case 'delete':
          setShowDeleteModal(true);
          break;
        case 'move':
          setShowMoveModal(true);
          break;
        case 'download':
          if (item.type === 'file' || item.type === 'document') {
            downloadDocument(item.id, {
              onSuccess: (data) => {
                if (data && data.downloadUrl) {
                  // Trigger browser download by creating a temporary link
                  const link = document.createElement('a');
                  link.href = data.downloadUrl;
                  link.setAttribute('download', item.name || 'document');
                  link.setAttribute('target', '_blank');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              },
              onError: (error) => {
                console.error('Error downloading document:', error);
                alert('Failed to generate download URL. Please try again.');
              }
            });
          } else if (item.type === 'folder') {
            alert('Folder download is not supported yet.');
          }
          break;
        case 'bulk-move':
          setShowBulkMoveModal(true);
          break;
        case 'bulk-delete':
          setShowDeleteModal(true);
          break;
        default:
          break;
      }
    }
  };

  const handleRenameItem = (item, newName) => {
    if (item.type === 'folder') {
      renameFolder({ folderId: item.id, name: newName }, {
        onSuccess: (updatedFolder) => {
          // The hook will automatically update the cache
          addToDocumentHistory('Folder renamed', newName);
        },
        onError: (error) => {
          console.error('Error renaming folder:', error);
          // Show error to user
        }
      });
    } else {
      renameDocument({ documentId: item.id, name: newName }, {
        onSuccess: (updatedDocument) => {
          // The hook will automatically update the cache
          addToDocumentHistory('Document renamed', newName);
        },
        onError: (error) => {
          console.error('Error renaming document:', error);
          // Show error to user
        }
      });
    }
  };

  const handleDeleteItem = (item) => {
    if (item.type === 'folder') {
      deleteFolder(item.id, {
        onSuccess: () => {
          // The hook will automatically update the cache
          addToDocumentHistory('Folder deleted', item.name);
          setShowDeleteModal(false);
          setContextMenuItem(null);
        },
        onError: (error) => {
          console.error('Error deleting folder:', error);
          // Show error to user
        }
      });
    } else {
      deleteDocument(item.id, {
        onSuccess: () => {
          // The hook will automatically update the cache
          addToDocumentHistory('Document deleted', item.name);
          setShowDeleteModal(false);
          setContextMenuItem(null);
        },
        onError: (error) => {
          console.error('Error deleting document:', error);
          // Show error to user
        }
      });
    }
  };

  // Wrapper function for single item delete from context menu
  const handleSingleDelete = () => {
    if (contextMenuItem) {
      handleDeleteItem(contextMenuItem);
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    // Delete all selected items
    selectedItems.forEach(item => {
      if (item.type === 'folder') {
        // Remove folder from structure
        const removeFolder = (folderList) => {
          return folderList.filter(folder => {
            if (folder.id === item.id) {
              return false; // Remove this folder
            }
            if (folder.children) {
              folder.children = removeFolder(folder.children);
            }
            return true;
          });
        };
        
        setFolders(prev => removeFolder(prev));
      } else {
        // Remove document from its folder (soft delete)
        setDocs(prev => {
          const updatedDocs = { ...prev };
          Object.keys(updatedDocs).forEach(folderId => {
            updatedDocs[folderId] = updatedDocs[folderId].map(doc => {
              if (doc.id === item.id) {
                return { ...doc, deleted: true }; // Mark as deleted instead of removing
              }
              return doc;
            });
          });
          return updatedDocs;
        });
      }
      
      // Log to history
      addToDocumentHistory(`${item.type === 'folder' ? 'Folder' : 'Document'} deleted`, item.name);
    });
    
    // Clear selection
    setSelectedItems([]);
    
    // Close modal
    setShowDeleteModal(false);
    setContextMenuItem(null);
  };

  const handleMoveItem = (item, destinationFolderId) => {
    if (item.type === 'folder') {
      moveFolder({ folderId: item.id, targetParentId: destinationFolderId }, {
        onSuccess: (updatedFolder) => {
          // The hook will automatically update the cache
          addToDocumentHistory('Folder moved', item.name);
        },
        onError: (error) => {
          console.error('Error moving folder:', error);
          // Show error to user
        }
      });
    } else {
      moveDocument({ documentId: item.id, targetFolderId: destinationFolderId }, {
        onSuccess: (updatedDocument) => {
          // The hook will automatically update the cache
          addToDocumentHistory('Document moved', item.name);
        },
        onError: (error) => {
          console.error('Error moving document:', error);
          // Show error to user
        }
      });
    }
  };

  // Bulk move
  const handleBulkMove = (destinationFolderId) => {
    // Move all selected items
    selectedItems.forEach(item => {
      if (item.type === 'folder') {
        moveFolder({ folderId: item.id, targetParentId: destinationFolderId }, {
          onSuccess: (updatedFolder) => {
            // The hook will automatically update the cache
            addToDocumentHistory('Folder moved', item.name);
          },
          onError: (error) => {
            console.error('Error moving folder:', error);
            // Show error to user
          }
        });
      } else {
        moveDocument({ documentId: item.id, targetFolderId: destinationFolderId }, {
          onSuccess: (updatedDocument) => {
            // The hook will automatically update the cache
            addToDocumentHistory('Document moved', item.name);
          },
          onError: (error) => {
            console.error('Error moving document:', error);
            // Show error to user
          }
        });
      }
    });
    
    // Clear selection
    setSelectedItems([]);
    setShowBulkMoveModal(false);
  };

  const addToDocumentHistory = (action, itemName) => {
    const newEntry = {
      id: Date.now().toString(),
      documentName: itemName,
      action: action,
      performedBy: 'Current User', // In a real app, this would be the actual user
      timestamp: new Date().toISOString()
    };
    
    setDocumentHistory(prev => [newEntry, ...prev]);
  };

  // Get child folders for the current selected folder
  const childFolders = getChildFolders();
  // folderDocuments is now fetched via the hook
  // const folderDocuments = selectedFolder === null ? docs.root || [] : docs[selectedFolder] || [];
  
  // Use imported document tags
  const allTags = documentTags;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Document Explorer</h1>
        <p className="mt-1 text-sm text-gray-500">Browse and manage your construction project documents and folders.</p>
      </div>

      {/* Breadcrumb - visible on all screen sizes */}
      <Breadcrumb path={getBreadcrumbPath()} onFolderSelect={handleFolderSelect} />

      {/* Mobile Header - only visible on mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white mb-2">
        <button 
          onClick={() => setShowMobileFolderDrawer(true)}
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex space-x-2">
          <button 
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
            onClick={() => setShowNewFolderModal(true)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button 
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
            onClick={() => setShowUploadModal(true)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 mt-4 overflow-hidden">
        {/* Folder Tree - hidden on mobile, visible on desktop */}
        <div className={`hidden lg:flex flex-col ${folderTreeCollapsed ? 'w-12' : 'w-64'} border-r border-gray-200 bg-white transition-all duration-300`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className={`text-lg font-medium text-gray-900 ${folderTreeCollapsed ? 'hidden' : ''}`}>Folders</h2>
            <button 
              onClick={() => setFolderTreeCollapsed(!folderTreeCollapsed)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={folderTreeCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!folderTreeCollapsed && (
              foldersLoading ? (
                <div className="p-4 text-center text-gray-500">Loading folders...</div>
              ) : foldersError ? (
                <div className="p-4 text-center text-red-500">Error loading folders</div>
              ) : (
                <FolderTree 
                  folders={folders} 
                  selectedFolder={selectedFolder} 
                  onSelectFolder={handleFolderSelect} 
                  expandedFolders={expandedFolders}
                  onToggleFolder={handleToggleFolder}
                />
              )
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar - visible on all screen sizes */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200 bg-white gap-4">
            <div className="flex justify-between space-x-2">
              <button 
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                onClick={() => setShowNewFolderModal(true)}
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                New Folder
              </button>
              <button 
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-surface dark:border-border-color dark:text-text-primary dark:hover:bg-dark-bg-primary"
                onClick={() => setShowUploadModal(true)}
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </button>
            </div>
            
            {/* View Toggle and Filter Buttons */}
            <div className="flex flex-wrap gap-2 justify-between">
              {/* View Toggle */}
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 ${
                    viewMode === 'list'
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-primary'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="ml-1 hidden sm:inline">List</span>
                </button>
                <button
                  type="button"
                  className={`-ml-px relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 ${
                    viewMode === 'thumbnail'
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-primary'
                  }`}
                  onClick={() => setViewMode('thumbnail')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="ml-1 hidden sm:inline">Thumbnails</span>
                </button>
              </div>
              
              {/* Filter Button */}
              <div className="relative ">
                <button
                  ref={filterButtonRef}
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-primary"
                >
                  <svg className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="hidden sm:inline">Filter</span>
                </button>

                {/* Filter Popover */}
                {showFilters && (
                  <div 
                    ref={filterPopoverRef}
                    className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-all duration-200 transform scale-100 opacity-100 dark:bg-dark-bg-secondary dark:ring-dark-border"
                    
                  >
                    <div className="p-4 max-h-96 overflow-y-auto scrollbar-hide">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">Filter Documents</h3>
                        <button 
                          onClick={() => setShowFilters(false)}
                          className="text-gray-400 hover:text-gray-500 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <form onSubmit={handleApplyFilters} className="space-y-4  pb-6">
                        <div>
                          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                            Search
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="search"
                              id="search"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                              placeholder="Search documents..."
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="file-type" className="block text-sm font-medium text-gray-700">
                            File Type
                          </label>
                          <div className="mt-1">
                            <CustomSelect
                              id="file-type"
                              name="file-type"
                              value={fileType}
                              onChange={setFileType}
                              options={[
                                { value: '', label: 'All Types' },
                                { value: 'PDF', label: 'PDF' },
                                { value: 'DWG', label: 'DWG' },
                                { value: 'XLSX', label: 'Excel' },
                                { value: 'ZIP', label: 'ZIP Archive' }
                              ]}
                              placeholder="Select file type"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">
                            Date Range
                          </label>
                          <div className="mt-1">
                            <CustomSelect
                              id="date-range"
                              name="date-range"
                              value={dateRange}
                              onChange={setDateRange}
                              options={[
                                { value: '', label: 'Any Time' },
                                { value: 'today', label: 'Today' },
                                { value: 'week', label: 'This Week' },
                                { value: 'month', label: 'This Month' },
                                { value: 'year', label: 'This Year' }
                              ]}
                              placeholder="Select date range"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Popular Tags
                          </label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {allTags.slice(0, 12).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleTagToggle(tag)}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  selectedTags.includes(tag)
                                    ? 'bg-accent-light text-accent-contrast'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                            Sort By
                          </label>
                          <div className="mt-1">
                            <CustomSelect
                              id="sort"
                              name="sort"
                              value={sortOption}
                              onChange={setSortOption}
                              options={[
                                { value: 'relevance', label: 'Relevance' },
                                { value: 'latest', label: 'Latest' },
                                { value: 'oldest', label: 'Oldest' }
                              ]}
                              placeholder="Sort by"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between pt-2">
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:hover:bg-dark-bg-primary "
                          >
                            Clear
                          </button>
                          <div className="space-x-2">
                            <button
                              type="button"
                              onClick={() => setShowFilters(false)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:hover:bg-dark-bg-primary"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bulk Action Toolbar */}
          <BulkActionToolbar
            selectedItems={selectedItems}
            onMove={() => setShowBulkMoveModal(true)}
            onDelete={() => setShowDeleteModal(true)}
            onDeselectAll={handleDeselectAll}
          />

          {/* Document List - now full width */}
          <div className="flex-1 overflow-hidden">
            <div className="w-full h-full overflow-y-auto bg-white">
              {documentsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
                </div>
              ) : documentsError ? (
                <div className="flex justify-center items-center h-64 text-red-500">
                  Error loading documents
                </div>
              ) : (
                <DocumentList 
                  folders={childFolders}
                  documents={folderDocuments}
                  onSelectDocument={handleDocumentSelect}
                  onSelectFolder={handleFolderItemClick}
                  selectedDocument={selectedDocument}
                  selectedFolder={selectedFolder}
                  viewMode={viewMode}
                  onContextMenuAction={handleContextMenuAction}
                  selectedItems={selectedItems}
                  onItemSelect={handleItemSelect}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  searchTerm={searchTerm}
                  fileType={fileType}
                  dateRange={dateRange}
                  selectedTags={selectedTags}
                  sortOption={sortOption}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Folder Drawer */}
      <MobileFolderDrawer
        isOpen={showMobileFolderDrawer}
        onClose={() => setShowMobileFolderDrawer(false)}
        folders={folders}
        selectedFolder={selectedFolder}
        onSelectFolder={(folderId) => {
          handleFolderSelect(folderId);
          setShowMobileFolderDrawer(false);
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onHomeClick={() => setMobileBottomNavActive('home')}
        onSearchClick={() => setMobileBottomNavActive('search')}
        onUploadClick={() => {
          setMobileBottomNavActive('upload');
          setShowUploadModal(true);
        }}
        onSettingsClick={() => setMobileBottomNavActive('settings')}
        activeTab={mobileBottomNavActive}
      />

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <NewFolderModal
          folders={folders}
          selectedFolder={selectedFolder}
          onClose={() => setShowNewFolderModal(false)}
          onCreate={handleCreateFolder}
          isLoading={isCreatingFolder}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          folders={folders}
          selectedFolder={selectedFolder}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
        />
      )}

      {/* Rename Modal */}
      {showRenameModal && contextMenuItem && (
        <RenameModal
          item={contextMenuItem}
          onClose={() => {
            setShowRenameModal(false);
            setContextMenuItem(null);
          }}
          onRename={handleRenameItem}
          isRenaming={contextMenuItem.type === 'folder' ? isRenamingFolder : isRenamingDocument}
        />
      )}

      {/* Move Modal */}
      {showMoveModal && contextMenuItem && (
        <MoveModal
          item={contextMenuItem}
          folders={folders}
          onClose={() => {
            setShowMoveModal(false);
            setContextMenuItem(null);
          }}
          onMove={handleMoveItem}
          isMoving={contextMenuItem.type === 'folder' ? isMovingFolder : isMovingDocument}
        />
      )}

      {/* Bulk Move Modal */}
      {showBulkMoveModal && selectedItems.length > 0 && (
        <MoveModal
          item={{name: `${selectedItems.length} items`, type: 'bulk'}}
          folders={folders}
          onClose={() => setShowBulkMoveModal(false)}
          onMove={(item, destinationFolderId) => handleBulkMove(destinationFolderId)}
          isMoving={selectedItems.some(item => item.type === 'folder') ? isMovingFolder : isMovingDocument}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          item={contextMenuItem || (selectedItems.length > 0 ? selectedItems : null)}
          onClose={() => {
            setShowDeleteModal(false);
            setContextMenuItem(null);
          }}
          onConfirm={contextMenuItem ? handleSingleDelete : handleBulkDelete}
          isDeleting={contextMenuItem ? 
            (contextMenuItem.type === 'folder' ? isDeletingFolder : isDeletingDocument) : 
            (selectedItems.some(item => item.type === 'folder') ? isDeletingFolder : isDeletingDocument)}
        />
      )}

      {/* Document Preview Modal */}
      {showPreviewModal && (
        <DocumentPreviewModal 
          document={selectedDocument} 
          onClose={() => setShowPreviewModal(false)} 
        />
      )}
      
      {/* Context Menu for empty area right-click */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        item={contextMenu.item}
        onItemClick={handleContextMenuItemClick}
        onClose={() => setContextMenu({ visible: false, x: 0, y: 0, item: null })}
      />
    </div>
  );
};

export default DocumentExplorer;