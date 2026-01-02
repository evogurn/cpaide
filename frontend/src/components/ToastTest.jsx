import React from 'react';
import { showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from '../utils/toastUtils';

const ToastTest = () => {
  const testSuccess = () => {
    showSuccessToast('Success toast is working!');
  };

  const testError = () => {
    showErrorToast('Error toast is working!');
  };

  const testInfo = () => {
    showInfoToast('Info toast is working!');
  };

  const testWarning = () => {
    showWarningToast('Warning toast is working!');
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Toast Test</h2>
      <p className="text-gray-600">Click the buttons below to test toast notifications.</p>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={testSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Test Success
        </button>
        
        <button
          onClick={testError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Test Error
        </button>
        
        <button
          onClick={testInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Test Info
        </button>
        
        <button
          onClick={testWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Test Warning
        </button>
      </div>
    </div>
  );
};

export default ToastTest;