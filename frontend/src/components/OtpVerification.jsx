import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verifyOtp, resendOtp } from '../services/authService';
import { storeToken, storeUser } from '../utils/authUtils'; // Import auth utils
import FeatureSlider from './FeatureSlider';

const OtpVerification = ({ email, verificationToken, userType, onBack }) => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Format timer as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value !== '' && index < 5 && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill('')).slice(0, 6);
      setOtp(newOtp);
      
      // Focus last filled input
      const lastFilledIndex = pastedData.length - 1;
      if (lastFilledIndex >= 0 && inputRefs.current[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex].focus();
      }
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await verifyOtp({
        email,
        otp: otpString,
        verificationToken,
      });

      if (result.success) {
        setSuccess(true);
        // Store token and user info for automatic login
        storeToken(result.data.accessToken);
        storeUser(result.data.user);
        // Log in the user automatically after successful verification
        authLogin(result.data.user);
        
        // Redirect based on user type
        setTimeout(() => {
          if (userType === 'tenant') {
            navigate('/'); // Redirect tenant admin to dashboard
          } else {
            navigate('/'); // Redirect regular user to dashboard
          }
        }, 1500);
      } else {
        setError(result.error || 'Failed to verify OTP');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (timer > 0) {
      setError('Please wait before requesting a new OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await resendOtp({ verificationToken });
      
      if (result.success) {
        setTimer(300); // Reset timer to 5 minutes
        setSuccess('New OTP sent successfully');
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        // Focus first input
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-dark-bg-primary">
      {/* Left Panel - OTP Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo - Left aligned */}
          <div className="text-left mb-8">
            <img 
              src="/assets/logo.png" 
              alt="Company Logo" 
              className="h-16 mb-6"
            />
            {/* Greeting - Centered within the verification section */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                Verify Your Email
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-2">
                Enter the 6-digit code sent to
              </p>
              <p className="text-accent font-medium mt-1">
                {email}
              </p>
            </div>
          </div>

          {/* OTP Verification Form */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg p-8">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Verification successful! Redirecting...
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-3">
                  Enter 6-digit code
                </label>
                <div className="flex justify-between space-x-3">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      disabled={loading || success}
                      className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent-light focus:outline-none dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className={`font-medium ${timer > 0 ? 'text-gray-500 dark:text-dark-text-secondary' : 'text-accent'}`}>
                    {timer > 0 ? `Expires in ${formatTime()}` : 'OTP expired'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || timer > 0}
                  className={`text-sm font-medium ${
                    timer > 0 
                      ? 'text-gray-400 cursor-not-allowed dark:text-dark-text-disabled' 
                      : 'text-accent hover:text-accent-dark dark:text-accent-light dark:hover:text-accent'
                  }`}
                >
                  Resend OTP
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={loading || success}
                  className="flex-1 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-primary"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={loading || success}
                  className={`flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-200 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
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

export default OtpVerification;