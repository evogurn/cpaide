import React from 'react';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const BulkActionToolbar = ({ selectedItems, onMove, onDelete, onDeselectAll }) => {
  if (selectedItems.length === 0) return null;

  const handleMove = () => {
    try {
      onMove();
      showSuccessToast(`${selectedItems.length} item(s) moved successfully!`);
    } catch (error) {
      showErrorToast('Failed to move items. Please try again.');
    }
  };

  const handleDelete = () => {
    try {
      onDelete();
      showSuccessToast(`${selectedItems.length} item(s) deleted successfully!`);
    } catch (error) {
      showErrorToast('Failed to delete items. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-200 border-b  dark:bg-gray-800">
      <div className="flex items-center">
        <span className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">
          {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
        </span>
        <button
          onClick={onDeselectAll}
          className="ml-4 text-sm text-black underline hover:no-underline dark:text-dark-text-primary"
        >
          Deselect all
        </button>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleMove}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-accent-dark dark:hover:bg-accent"
        >
          <svg className="-ml-0.5 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Move
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="-ml-0.5 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default BulkActionToolbar;