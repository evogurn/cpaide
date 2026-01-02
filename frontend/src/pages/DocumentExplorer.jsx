import React, { useState, useRef, useEffect } from 'react';
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
import { documents, documentTags, documentHistory as mockDocumentHistory } from '../data/index';
import { getFolders, getAllFolders, createFolder, updateFolder, moveFolder, deleteFolder } from '../services/folderService';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { buildFolderTree } from '../utils/folderUtils';

const DocumentExplorer = () => {
  const [selectedFolder, setSelectedFolder] = useState('city');
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
  
  const filterButtonRef = useRef(null);
  const filterPopoverRef = useRef(null);

  // Use API to fetch folder structure
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);

  // Use imported documents data
  const [docs, setDocs] = useState(documents);

  // Use imported document history
  const [documentHistory, setDocumentHistory] = useState(mockDocumentHistory);

  // Fetch folders from API
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoadingFolders(true);
        // Get all folders as flat list and build tree structure
        const folderData = await getAllFolders();
        const folderTree = buildFolderTree(folderData);
        setFolders(folderTree);
        // Set default selected folder to the first folder if none selected
        if (folderTree.length > 0 && !selectedFolder) {
          setSelectedFolder(folderTree[0].id);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
        showErrorToast('Failed to load folder structure');
      } finally {
        setLoadingFolders(false);
      }
    };

    fetchFolders();
  }, []);

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('documentExplorerViewMode', viewMode);
  }, [viewMode]);

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

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleFolderItemClick = (folder) => {
    handleFolderSelect(folder.id);
  };

  // Multi-selection handlers
  const handleItemSelect = (item, event) => {
    // If Ctrl/Cmd key is pressed, toggle selection
    if (event.ctrlKey || event.metaKey) {
      if (selectedItems.some(selectedItem => selectedItem.id === item.id)) {
        // Remove from selection
        setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== item.id));
      } else {
        // Add to selection
        setSelectedItems([...selectedItems, item]);
      }
    }
    // If Shift key is pressed, select range
    else if (event.shiftKey) {
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

  const handleCreateFolder = async (newFolderName, parentFolderId) => {
    try {
      const folderData = {
        name: newFolderName,
        ...(parentFolderId && { parentId: parentFolderId })
      };
      
      const newFolder = await createFolder(folderData);
      
      // Add new folder to the parent
      const addFolder = (folderList) => {
        return folderList.map(folder => {
          if (folder.id === parentFolderId) {
            return {
              ...folder,
              children: [...(folder.children || []), {...newFolder, children: []}]
            };
          }
          if (folder.children) {
            return {
              ...folder,
              children: addFolder(folder.children)
            };
          }
          return folder;
        });
      };

      // If no parent, add to root level
      if (!parentFolderId) {
        setFolders(prev => [...prev, {...newFolder, children: []}]);
      } else {
        setFolders(prev => addFolder(prev));
      }
      
      setShowNewFolderModal(false);
      showSuccessToast('Folder created successfully');
    } catch (error) {
      console.error('Error creating folder:', error);
      showErrorToast('Failed to create folder');
    }
  };

  const handleFileUpload = ({ file, title, description, tags, folderId }) => {
    // Get file extension and type
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toUpperCase();
    const fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    
    // Create new document
    const newDocument = {
      id: Date.now(),
      name: title,
      type: fileExtension,
      size: fileSize,
      modified: new Date().toISOString().split('T')[0],
      icon: fileExtension.toLowerCase()
    };
    
    // Add document to the selected folder
    setDocs(prev => {
      const updatedDocs = { ...prev };
      if (!updatedDocs[folderId]) {
        updatedDocs[folderId] = [];
      }
      updatedDocs[folderId] = [...updatedDocs[folderId], newDocument];
      return updatedDocs;
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

  // Context menu actions
  const handleContextMenuAction = (action, item) => {
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
        // In a real app, this would trigger a file download
        console.log('Downloading:', item);
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
  };

  const handleRenameItem = async (item, newName) => {
    if (item.type === 'folder') {
      try {
        // Update folder name via API
        await updateFolder(item.id, { name: newName });
        
        // Update folder name in local state
        setFolders(prev => updateFolderStructure(prev, item.id, folder => ({
          ...folder,
          name: newName
        })));
        
        showSuccessToast('Folder renamed successfully');
      } catch (error) {
        console.error('Error renaming folder:', error);
        showErrorToast('Failed to rename folder');
      }
    } else {
      // Update document name
      setDocs(prev => {
        const updatedDocs = { ...prev };
        Object.keys(updatedDocs).forEach(folderId => {
          updatedDocs[folderId] = updatedDocs[folderId].map(doc => 
            doc.id === item.id ? { ...doc, name: newName } : doc
          );
        });
        return updatedDocs;
      });
    }
    
    // Log to history
    addToDocumentHistory(`${item.type === 'folder' ? 'Folder' : 'Document'} renamed`, newName);
  };

  const handleDeleteItem = async (item) => {
    if (item.type === 'folder') {
      try {
        // Delete folder via API
        await deleteFolder(item.id);
        
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
        showSuccessToast('Folder deleted successfully');
      } catch (error) {
        console.error('Error deleting folder:', error);
        showErrorToast('Failed to delete folder');
      }
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
    
    // Close modal
    setShowDeleteModal(false);
    setContextMenuItem(null);
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

  const handleMoveItem = async (item, destinationFolderId) => {
    if (item.type === 'folder') {
      try {
        // Move folder via API
        await moveFolder(item.id, destinationFolderId);
        
        // Moving a folder is more complex - we need to:
        // 1. Remove it from its current parent
        // 2. Add it to the new parent
        let folderToMove = null;
        
        // First, find and remove the folder
        const removeFolder = (folderList) => {
          return folderList.filter(folder => {
            if (folder.id === item.id) {
              folderToMove = { ...folder };
              return false;
            }
            if (folder.children) {
              folder.children = removeFolder(folder.children);
            }
            return true;
          });
        };
        
        // Then add it to the destination
        const addFolder = (folderList) => {
          return folderList.map(folder => {
            if (folder.id === destinationFolderId) {
              return {
                ...folder,
                children: [...(folder.children || []), folderToMove]
              };
            }
            if (folder.children) {
              return {
                ...folder,
                children: addFolder(folder.children)
              };
            }
            return folder;
          });
        };
        
        setFolders(prev => {
          const afterRemoval = removeFolder(prev);
          // If moving to root (no destination), add to root level
          if (!destinationFolderId) {
            return [...afterRemoval, folderToMove];
          }
          return addFolder(afterRemoval);
        });
        
        showSuccessToast('Folder moved successfully');
      } catch (error) {
        console.error('Error moving folder:', error);
        showErrorToast('Failed to move folder');
      }
    } else {
      // Moving a document - remove from current folder and add to new folder
      setDocs(prev => {
        const updatedDocs = { ...prev };
        let documentToMove = null;
        
        // Find and remove document from current folder
        Object.keys(updatedDocs).forEach(folderId => {
          updatedDocs[folderId] = updatedDocs[folderId].filter(doc => {
            if (doc.id === item.id) {
              documentToMove = { ...doc };
              return false;
            }
            return true;
          });
        });
        
        // Add to destination folder
        if (documentToMove && updatedDocs[destinationFolderId]) {
          updatedDocs[destinationFolderId] = [...updatedDocs[destinationFolderId], documentToMove];
        } else if (documentToMove) {
          updatedDocs[destinationFolderId] = [documentToMove];
        }
        
        return updatedDocs;
      });
    }
    
    // Log to history
    addToDocumentHistory(`${item.type === 'folder' ? 'Folder' : 'Document'} moved`, item.name);
  };

  // Bulk move
  const handleBulkMove = (destinationFolderId) => {
    // Move all selected items
    selectedItems.forEach(item => {
      if (item.type === 'folder') {
        // Moving a folder is more complex - we need to:
        // 1. Remove it from its current parent
        // 2. Add it to the new parent
        let folderToMove = null;
        
        // First, find and remove the folder
        const removeFolder = (folderList) => {
          return folderList.filter(folder => {
            if (folder.id === item.id) {
              folderToMove = { ...folder };
              return false;
            }
            if (folder.children) {
              folder.children = removeFolder(folder.children);
            }
            return true;
          });
        };
        
        // Then add it to the destination
        const addFolder = (folderList) => {
          return folderList.map(folder => {
            if (folder.id === destinationFolderId) {
              return {
                ...folder,
                children: [...(folder.children || []), folderToMove]
              };
            }
            if (folder.children) {
              return {
                ...folder,
                children: addFolder(folder.children)
              };
            }
            return folder;
          });
        };
        
        setFolders(prev => {
          const afterRemoval = removeFolder(prev);
          return addFolder(afterRemoval);
        });
      } else {
        // Moving a document - remove from current folder and add to new folder
        setDocs(prev => {
          const updatedDocs = { ...prev };
          let documentToMove = null;
          
          // Find and remove document from current folder
          Object.keys(updatedDocs).forEach(folderId => {
            updatedDocs[folderId] = updatedDocs[folderId].filter(doc => {
              if (doc.id === item.id) {
                documentToMove = { ...doc };
                return false;
              }
              return true;
            });
          });
          
          // Add to destination folder
          if (documentToMove && updatedDocs[destinationFolderId]) {
            updatedDocs[destinationFolderId] = [...updatedDocs[destinationFolderId], documentToMove];
          } else if (documentToMove) {
            updatedDocs[destinationFolderId] = [documentToMove];
          }
          
          return updatedDocs;
        });
      }
      
      // Log to history
      addToDocumentHistory(`${item.type === 'folder' ? 'Folder' : 'Document'} moved`, item.name);
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

  // Get child folders and documents for the current selected folder
  const childFolders = getChildFolders();
  const folderDocuments = docs[selectedFolder] || [];
  
  // Use imported document tags
  const allTags = documentTags;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Document Explorer</h1>
        <p className="mt-1 text-sm text-gray-500">Browse and manage your construction project documents and folders.</p>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb path={getBreadcrumbPath()} onFolderSelect={handleFolderSelect} />

      <div className="flex flex-1 mt-4 overflow-hidden">
        {/* Folder Tree */}
        <div className={`flex flex-col ${folderTreeCollapsed ? 'w-12' : 'w-64'} border-r border-gray-200 bg-white transition-all duration-300`}>
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
              <FolderTree 
                folders={folders} 
                selectedFolder={selectedFolder} 
                onSelectFolder={handleFolderSelect} 
              />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex space-x-2">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </button>
            </div>
            
            {/* View Toggle and Filter Buttons */}
            <div className="flex space-x-2">
              {/* View Toggle */}
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent ${
                    viewMode === 'list'
                      ? 'bg-accent text-accent-contrast'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-primary'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="ml-1">List</span>
                </button>
                <button
                  type="button"
                  className={`-ml-px relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent ${
                    viewMode === 'thumbnail'
                      ? 'bg-accent text-accent-contrast'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-primary'
                  }`}
                  onClick={() => setViewMode('thumbnail')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="ml-1">Thumbnails</span>
                </button>
              </div>
              
              {/* Filter Button */}
              <div className="relative">
                <button
                  ref={filterButtonRef}
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-primary"
                >
                  <svg className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>

                {/* Filter Popover */}
                {showFilters && (
                  <div 
                    ref={filterPopoverRef}
                    className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-all duration-200 transform scale-100 opacity-100 dark:bg-dark-bg-secondary dark:ring-dark-border"
                  >
                    <div className="p-4 max-h-96 overflow-y-auto">
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
            </div>
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <NewFolderModal
          folders={folders}
          selectedFolder={selectedFolder}
          onClose={() => setShowNewFolderModal(false)}
          onCreate={handleCreateFolder}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          folders={folders}
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
        />
      )}

      {/* Bulk Move Modal */}
      {showBulkMoveModal && selectedItems.length > 0 && (
        <MoveModal
          item={{name: `${selectedItems.length} items`, type: 'bulk'}}
          folders={folders}
          onClose={() => setShowBulkMoveModal(false)}
          onMove={(item, destinationFolderId) => handleBulkMove(destinationFolderId)}
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
        />
      )}

      {/* Document Preview Modal */}
      {showPreviewModal && (
        <DocumentPreviewModal 
          document={selectedDocument} 
          onClose={() => setShowPreviewModal(false)} 
        />
      )}
    </div>
  );
};

export default DocumentExplorer;