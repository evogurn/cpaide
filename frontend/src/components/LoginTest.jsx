import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { showErrorToast, showSuccessToast } from '../utils/toastUtils';

const LoginTest = () => {
  // Simple login mutation for testing
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => {
      // Simulate API call
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === 'test@example.com' && password === 'password') {
            resolve({ success: true, data: { user: { name: 'Test User' } } });
          } else {
            resolve({ success: false, error: 'Invalid credentials. Please try again.' });
          }
        }, 1000);
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccessToast('Login successful! Redirecting...');
      } else {
        showErrorToast(data.error || 'Login failed. Please check your credentials.');
      }
    },
    onError: (error) => {
      showErrorToast('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    },
  });

  const handleTestLogin = () => {
    loginMutation.mutate({ email: 'test@example.com', password: 'wrongpassword' });
  };

  const handleTestSuccessLogin = () => {
    loginMutation.mutate({ email: 'test@example.com', password: 'password' });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Login Toast Test</h2>
      <p className="text-gray-600">Click the buttons below to test login toast notifications.</p>
      
      <div className="grid grid-cols-1 gap-3 mt-4">
        <button
          onClick={handleTestLogin}
          disabled={loginMutation.isPending}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loginMutation.isPending ? 'Logging in...' : 'Test Failed Login'}
        </button>
        
        <button
          onClick={handleTestSuccessLogin}
          disabled={loginMutation.isPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {loginMutation.isPending ? 'Logging in...' : 'Test Successful Login'}
        </button>
      </div>
    </div>
  );
};

export default LoginTest;