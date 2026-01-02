import React, { useState } from 'react';
import CustomSelect from './CustomSelect';

const NewFolderModal = ({ folders, selectedFolder, onClose, onCreate }) => {
  const [folderName, setFolderName] = useState('');
  const [destinationFolder, setDestinationFolder] = useState(selectedFolder);

  // Function to get all folders with their paths for the dropdown
  const getAllFoldersWithPaths = (folderArray, prefix = '') => {
    let result = [];
    folderArray.forEach(folder => {
      const path = prefix ? `${prefix} / ${folder.name}` : folder.name;
      result.push({ id: folder.id, name: path });
      if (folder.children && folder.children.length > 0) {
        result = result.concat(getAllFoldersWithPaths(folder.children, path));
      }
    });
    return result;
  };

  const handleCreate = () => {
    if (!folderName.trim()) return;
    
    onCreate({
      name: folderName,
      parentId: destinationFolder
    });
    
    setFolderName('');
    onClose();
  };

  // Get folder names for display
  const getFolderName = (folderId) => {
    const findFolder = (folders, id) => {
      for (const folder of folders) {
        if (folder.id === id) return folder;
        if (folder.children) {
          const found = findFolder(folder.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const folder = findFolder(folders, folderId);
    return folder ? folder.name : 'Unknown';
  };

  const currentPath = getFolderName(selectedFolder) || 'City';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-dark-bg-secondary">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-dark-bg-secondary">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary">
                  Create New Folder
                </h3>
                <div className="mt-4">
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                        Folder Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="folder-name"
                          value={folderName}
                          onChange={(e) => setFolderName(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 block w-full sm:text-sm transition-all duration-200 dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:placeholder-dark-text-disabled"
                          placeholder="Enter folder name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="current-path" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                        Current Location
                      </label>
                      <div className="mt-1">
                        <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700 dark:bg-dark-bg-tertiary dark:text-dark-text-primary">
                          {currentPath}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="destination-folder" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                        Destination Folder
                      </label>
                      <div className="mt-1">
                        <CustomSelect
                          id="destination-folder"
                          name="destination-folder"
                          value={destinationFolder}
                          onChange={setDestinationFolder}
                          options={getAllFoldersWithPaths(folders).map((f) => ({
                            value: f.id,
                            label: f.name
                          }))}
                          placeholder="Select destination folder"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-dark-bg-tertiary">
            <button
              type="button"
              disabled={!folderName.trim()}
              onClick={handleCreate}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-accent-contrast focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:ml-3 sm:w-auto sm:text-sm ${
                folderName.trim()
                  ? 'bg-accent hover:bg-accent-dark'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewFolderModal;