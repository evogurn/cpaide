import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import InputField from '../../components/InputField';
import { initiateOtp } from '../../services/authService';
import OtpVerification from '../../components/OtpVerification';
import FeatureSlider from '../../components/FeatureSlider';

const UserRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [verificationData, setVerificationData] = useState({
    email: '',
    verificationToken: '',
    userType: 'user'
  });
  
  // Get tenant info from URL params if available
  const tenantName = searchParams.get('tenant') || '';
  const tenantId = searchParams.get('tenantId') || '';

  // Form validation schema
  const userRegisterSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: userRegisterSchema,
    onSubmit: async (values) => {
      // Check if tenantId is provided
      if (!tenantId) {
        formik.setFieldError('email', 'Missing tenant information. Please use a valid registration link.');
        return;
      }

      try {
        // Prepare payload for OTP initiation
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          tenantId: tenantId,
        };

        const result = await initiateOtp({
          userType: 'user',
          email: values.email,
          payload,
          tenantId: tenantId,
        });

        if (result.success) {
          // Move to OTP verification step
          setVerificationData({
            email: values.email,
            verificationToken: result.data.verificationToken,
            userType: 'user'
          });
          setStep('otp');
        } else {
          // Handle initiation error
          formik.setFieldError('email', result.error);
        }
      } catch (error) {
        formik.setFieldError('email', 'An unexpected error occurred. Please try again.');
      }
    },
  });

  const handleBackToForm = () => {
    setStep('form');
  };

  if (step === 'otp') {
    return (
      <OtpVerification 
        email={verificationData.email}
        verificationToken={verificationData.verificationToken}
        userType={verificationData.userType}
        onBack={handleBackToForm}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-dark-bg-primary">
      {/* Left Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo - Left aligned */}
          <div className="text-left mb-8">
            <img 
              src="/assets/logo.png" 
              alt="Company Logo" 
              className="h-16 mb-6"
            />
            {/* Greeting - Centered within the registration section */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                Create Your Account
              </h1>
              {tenantName && (
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-dark-text-secondary">
                  For {tenantName}
                </p>
              )}
              <p className="text-gray-600 dark:text-dark-text-secondary mt-2">
                Join your organization
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg p-8">
            {(formik.errors.firstName && formik.touched.firstName) || 
             (formik.errors.lastName && formik.touched.lastName) || 
             (formik.errors.email && formik.touched.email) || 
             (formik.errors.password && formik.touched.password) || 
             (formik.errors.confirmPassword && formik.touched.confirmPassword) ? (
              <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Please check the form for errors
                    </h3>
                  </div>
                </div>
              </div>
            ) : null}
            
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputField
                    id="firstName"
                    label="First Name"
                    type="text"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="John"
                    required
                    error={!!(formik.errors.firstName && formik.touched.firstName)}
                    errorMessage={formik.errors.firstName}
                  />
                </div>
                
                <div>
                  <InputField
                    id="lastName"
                    label="Last Name"
                    type="text"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Doe"
                    required
                    error={!!(formik.errors.lastName && formik.touched.lastName)}
                    errorMessage={formik.errors.lastName}
                  />
                </div>
              </div>
              
              <div>
                <InputField
                  id="email"
                  label="Email Address"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="john.doe@company.com"
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
              
              <div>
                <InputField
                  id="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="••••••••"
                  required
                  error={!!(formik.errors.confirmPassword && formik.touched.confirmPassword)}
                  errorMessage={formik.errors.confirmPassword}
                  showPasswordToggle={true}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-200 ${
                    formik.isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {formik.isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Verification Code...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </form>
            
            {/* Login CTA - Simple link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-accent hover:text-accent-dark dark:text-accent-light dark:hover:text-accent focus:outline-none"
                >
                  Login here
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

export default UserRegister;