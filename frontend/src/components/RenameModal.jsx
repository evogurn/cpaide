import React, { useState, useEffect } from 'react';

const RenameModal = ({ item, onClose, onRename }) => {
  const [name, setName] = useState(item?.name || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(item?.name || '');
  }, [item]);

  const validateName = (newName) => {
    if (!newName.trim()) {
      return 'Name cannot be empty';
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
    if (invalidChars.test(newName)) {
      return 'Name contains invalid characters (< > : " / \\ | ? *)';
    }
    
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // If name hasn't changed, just close the modal
    if (name === item.name) {
      onClose();
      return;
    }
    
    onRename(item, name);
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
                    Rename {item?.type === 'folder' ? 'Folder' : 'Document'}
                  </h3>
                  <div className="mt-4">
                    <div className="mt-1">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError('');
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent block w-full sm:text-sm dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                        placeholder={`Enter new ${item?.type === 'folder' ? 'folder' : 'document'} name`}
                        autoFocus
                      />
                      {error && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse dark:bg-dark-bg-tertiary">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-accent-contrast hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:ml-3 sm:w-auto sm:text-sm"
              >
                Rename
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

export default RenameModal;