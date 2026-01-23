import React from 'react';
import useToast from '../hooks/useToast';

const ToastHookDemo = () => {
  const { success, error, info, warning, loading, dismiss, promise } = useToast();

  const handleSuccessToast = () => {
    success('Operation completed successfully!');
  };

  const handleErrorToast = () => {
    error('An error occurred while processing your request.');
  };

  const handleInfoToast = () => {
    info('Here is some useful information for you.');
  };

  const handleWarningToast = () => {
    warning('This action requires your attention.');
  };

  const handleLoadingToast = () => {
    const toastId = loading('Processing your request...');
    
    // Simulate async operation
    setTimeout(() => {
      dismiss(toastId);
      success('Request processed successfully!');
    }, 3000);
  };

  const handlePromiseToast = () => {
    const mockApiCall = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Randomly resolve or reject for demo purposes
          if (Math.random() > 0.5) {
            resolve({ message: 'Data fetched successfully!' });
          } else {
            reject(new Error('Failed to fetch data'));
          }
        }, 2000);
      });
    };

    promise(mockApiCall(), {
      loading: 'Fetching data...',
      success: (data) => data.message,
      error: (err) => err.message,
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Toast Hook Demo</h2>
      <p className="text-gray-600">Click the buttons below to see different toast notifications using the useToast hook.</p>
      
      <div className="grid grid-cols-1 gap-3 mt-4">
        <button
          onClick={handleSuccessToast}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Success Toast
        </button>
        
        <button
          onClick={handleErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Error Toast
        </button>
        
        <button
          onClick={handleInfoToast}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Info Toast
        </button>
        
        <button
          onClick={handleWarningToast}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Warning Toast
        </button>
        
        <button
          onClick={handleLoadingToast}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Loading Toast
        </button>
        
        <button
          onClick={handlePromiseToast}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
        >
          Promise Toast
        </button>
      </div>
    </div>
  );
};

export default ToastHookDemo;