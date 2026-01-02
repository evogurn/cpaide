import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { useMutation } from '@tanstack/react-query';
import InputField from '../../components/InputField';
import { login } from '../../utils/authUtils';
import { useAuth } from '../../contexts/AuthContext';
import loginSchema from '../../validation/loginSchema';
import FeatureSlider from '../../components/FeatureSlider';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the page they were trying to access, or to dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      if (data.success) {
        // Show success toast
        showSuccessToast('Login successful! Redirecting...');
        // Update auth context
        authLogin(data.data.user);
        // Redirect to the page they were trying to access, or to dashboard
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        // Show error toast for login failures
        showErrorToast(data.error || 'Login failed. Please check your credentials.');
      }
    },
    onError: (error) => {
      // Show error toast for network or unexpected errors
      showErrorToast('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    },
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      console.log('Form submitted with values:', values);
      loginMutation.mutate(values);
    },
  });

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-dark-bg-primary">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo - Left aligned */}
          <div className="text-left mb-8">
            <img 
              src="/assets/logo.png" 
              alt="Company Logo" 
              className="h-16 mb-6"
            />
            {/* Greeting - Centered within the login section */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                Hi, Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-2">
                Enter your credentials to continue
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg p-8">
            {/* Removed the error message div that was here */}
            
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <div>
                <InputField
                  id="email"
                  label="Email address"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="you@example.com"
                  required
                  error={!!(formik.errors.email && formik.touched.email)}
                  errorMessage={formik.errors.email}
                />
              </div>
              
              <div>
                <InputField
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="••••••••"
                  required
                  error={!!(formik.errors.password && formik.touched.password)}
                  errorMessage={formik.errors.password}
                  showPasswordToggle={true}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded dark:bg-dark-bg-tertiary dark:border-dark-border"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900 dark:text-dark-text-primary">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="font-medium text-accent hover:text-accent-dark dark:text-accent-light dark:hover:text-accent">
                    Forgot your password?
                  </a>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-200 ${
                    loginMutation.isPending ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loginMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
            
            {/* Registration CTA - Simple link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register/user')}
                  className="font-medium text-accent hover:text-accent-dark dark:text-accent-light dark:hover:text-accent focus:outline-none"
                >
                  Create account
                </button>
              </p>
            </div>
            
            {/* Demo Credentials Card */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Demo Credentials</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Email: admin@demo.com</span>
                  <button 
                    onClick={() => copyToClipboard('admin@demo.com')}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Password: Admin@123</span>
                  <button 
                    onClick={() => copyToClipboard('Admin@123')}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tenant Registration Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Want to create a new organization?{' '}
                <button
                  onClick={() => navigate('/register/tenant')}
                  className="font-medium text-accent hover:text-accent-dark dark:text-accent-light dark:hover:text-accent focus:outline-none"
                >
                  Register your organization
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Feature Slider (Hidden on mobile, visible on lg+) */}
      <div className="hidden lg:block lg:w-1/2">
        <FeatureSlider />
      </div>
    </div>
  );
};

export default Login;