import React from 'react';

const DocumentPreview = ({ document, onClose }) => {
  if (!document) return null;

  const getPreviewContent = () => {
    switch (document.icon) {
      case 'pdf':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-red-100 rounded-lg p-6 mb-6">
              <svg className="h-16 w-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
            <p className="text-sm text-gray-500 mt-1">PDF Document</p>
            <div className="mt-6 bg-gray-100 border-2 border-dashed rounded-xl w-64 h-80 flex items-center justify-center">
              <p className="text-gray-500 text-sm">PDF preview would appear here</p>
            </div>
          </div>
        );
      case 'doc':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-blue-100 rounded-lg p-6 mb-6">
              <svg className="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Word Document</p>
            <div className="mt-6 bg-gray-100 border-2 border-dashed rounded-xl w-64 h-80 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Document content preview would appear here</p>
            </div>
          </div>
        );
      case 'txt':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-green-100 rounded-lg p-6 mb-6">
              <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Text Document</p>
            <div className="mt-6 bg-gray-100 border-2 border-dashed rounded-xl w-64 h-80 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Text content preview would appear here</p>
            </div>
          </div>
        );
      case 'ppt':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-yellow-100 rounded-lg p-6 mb-6">
              <svg className="h-16 w-16 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Presentation</p>
            <div className="mt-6 bg-gray-100 border-2 border-dashed rounded-xl w-64 h-80 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Slide thumbnails would appear here</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <svg className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Document</p>
            <div className="mt-6 bg-gray-100 border-2 border-dashed rounded-xl w-64 h-80 flex items-center justify-center">
              <p className="text-gray-500 text-sm">File preview would appear here</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Preview</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto p-6">
        {getPreviewContent()}
        
        {/* Document metadata */}
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-900 mb-4">Document Details</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">File Name</p>
                <p className="text-sm text-gray-900">{document.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">File Type</p>
                <p className="text-sm text-gray-900">{document.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">File Size</p>
                <p className="text-sm text-gray-900">{document.size}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Modified</p>
                <p className="text-sm text-gray-900">{document.modified}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-sm text-gray-900">/Documents/{document.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview actions */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Download
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-accent-contrast bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            Open Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;