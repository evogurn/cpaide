import React, { useState } from 'react';
import CustomSelect from './CustomSelect';

const MoveModal = ({ item, folders, onClose, onMove }) => {
  const [destinationFolder, setDestinationFolder] = useState('');

  // Function to get all folders with their paths for the dropdown
  const getAllFoldersWithPaths = (folderArray, prefix = '', excludeId = null) => {
    let result = [];
    folderArray.forEach(folder => {
      // Skip the folder being moved if it's a folder, and exclude the folder itself to prevent moving into itself
      if (excludeId && folder.id === excludeId) return;
      
      const path = prefix ? `${prefix} / ${folder.name}` : folder.name;
      result.push({ id: folder.id, name: path });
      
      if (folder.children && folder.children.length > 0) {
        result = result.concat(getAllFoldersWithPaths(folder.children, path, excludeId));
      }
    });
    return result;
  };

  const folderOptions = getAllFoldersWithPaths(folders, '', item.type === 'folder' ? item.id : null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!destinationFolder) return;
    
    onMove(item, destinationFolder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-dark-bg-secondary">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-dark-bg-secondary">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary">
                    Move {item?.type === 'folder' ? 'Folder' : 'Document'}
                  </h3>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                      Select the destination folder for "{item?.name}"
                    </p>
                    <div className="mt-4">
                      <label htmlFor="destination-folder" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                        Destination Folder
                      </label>
                      <div className="mt-1">
                        <CustomSelect
                          id="destination-folder"
                          name="destination-folder"
                          value={destinationFolder}
                          onChange={setDestinationFolder}
                          options={[
                            { value: '', label: 'Select a folder' },
                            ...folderOptions.map(folder => ({
                              value: folder.id,
                              label: folder.name
                            }))
                          ]}
                          placeholder="Select destination folder"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-dark-bg-tertiary">
              <button
                type="submit"
                disabled={!destinationFolder}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-accent-contrast focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:ml-3 sm:w-auto sm:text-sm ${
                  destinationFolder
                    ? 'bg-accent hover:bg-accent-dark'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Move
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;