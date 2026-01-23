import React from 'react';

const RestoreDocumentModal = ({ document, onClose, onConfirm }) => {
  if (!document) return null;

  // Check if this is a bulk action (document will have a count property)
  const isBulkAction = document.count !== undefined;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div 
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 dark:bg-dark-bg-secondary">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary">
                {isBulkAction ? "Restore Documents" : "Restore Document"}
              </h3>
              <div className="mt-2">
                {isBulkAction ? (
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Are you sure you want to restore <span className="font-medium">{document.count} documents</span>? 
                    The documents will be moved back to their original locations.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                      Are you sure you want to restore <span className="font-medium">{document.name}</span>? 
                      The document will be moved back to its original location:
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      {document.originalLocation}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm dark:focus:ring-offset-dark-bg-secondary"
              onClick={onConfirm}
            >
              {isBulkAction ? "Restore All" : "Restore"}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:mt-0 sm:w-auto sm:text-sm dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-bg-primary dark:focus:ring-offset-dark-bg-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestoreDocumentModal;