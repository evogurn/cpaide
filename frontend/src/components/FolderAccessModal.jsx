import React, { useState } from 'react';
import CustomSelect from './CustomSelect';
import { folderStructure, folderPermissions as mockFolderPermissions } from '../data/index';

const FolderAccessModal = ({ user, onSave, onClose }) => {
  // Use imported folder structure
  const folders = folderStructure;

  // Use imported user folder permissions
  const [folderPermissions, setFolderPermissions] = useState(mockFolderPermissions);

  const handlePermissionChange = (folderId, permission) => {
    setFolderPermissions({
      ...folderPermissions,
      [folderId]: permission
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(folderPermissions);
  };

  const renderFolderTree = (folders, level = 0) => {
    return folders.map((folder) => (
      <div key={folder.id}>
        <div className="flex items-center py-2" style={{ paddingLeft: `${level * 20}px` }}>
          <div className="flex-shrink-0 h-5 w-5 text-gray-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700">{folder.name}</span>
          <div className="ml-auto">
            <CustomSelect
              value={folderPermissions[folder.id] || 'no-access'}
              onChange={(value) => handlePermissionChange(folder.id, value)}
              options={[
                { value: 'no-access', label: 'No Access' },
                { value: 'view', label: 'View Only' },
                { value: 'edit', label: 'Edit' }
              ]}
              className="w-32"
            />
          </div>
        </div>
        {folder.children && folder.children.length > 0 && (
          <div className="ml-4 border-l border-gray-200">
            {renderFolderTree(folder.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Manage Folder Access for {user.name}
                  </h3>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Set folder access permissions for this user. Changes will take effect immediately.
                    </p>
                  </div>
                  <div className="mt-6">
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      {renderFolderTree(folders)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-accent-contrast hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm  dark:hover:bg-dark-bg-primary"
                onClick={onClose}
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

export default FolderAccessModal;