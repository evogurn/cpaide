import { toast } from 'sonner';

/**
 * Show a success toast notification
 * @param {string} message - The message to display
 * @param {object} options - Additional options for the toast
 */
export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    position: 'top-right',
    duration: 3000,
    ...options
  });
};

/**
 * Show an error toast notification
 * @param {string} message - The message to display
 * @param {object} options - Additional options for the toast
 */
export const showErrorToast = (message, options = {}) => {
  return toast.error(message, {
    position: 'top-right',
    duration: 5000,
    ...options
  });
};

/**
 * Show an info toast notification
 * @param {string} message - The message to display
 * @param {object} options - Additional options for the toast
 */
export const showInfoToast = (message, options = {}) => {
  return toast.info(message, {
    position: 'top-right',
    duration: 4000,
    ...options
  });
};

/**
 * Show a warning toast notification
 * @param {string} message - The message to display
 * @param {object} options - Additional options for the toast
 */
export const showWarningToast = (message, options = {}) => {
  return toast.warning(message, {
    position: 'top-right',
    duration: 4000,
    ...options
  });
};

/**
 * Show a loading toast notification
 * @param {string} message - The message to display
 * @param {object} options - Additional options for the toast
 */
export const showLoadingToast = (message, options = {}) => {
  return toast.loading(message, {
    position: 'top-right',
    ...options
  });
};

/**
 * Dismiss a toast notification
 * @param {string|number} toastId - The ID of the toast to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Promise toast helper that shows loading, success, or error states
 * @param {Promise} promise - The promise to track
 * @param {object} options - Options including loading, success, and error messages
 */
export const showToastPromise = (promise, options) => {
  const {
    loading = 'Loading...',
    success = 'Success!',
    error = 'Something went wrong',
    ...toastOptions
  } = options;

  return toast.promise(promise, {
    loading,
    success,
    error
  }, {
    position: 'top-right',
    ...toastOptions
  });
};

export default {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showLoadingToast,
  dismissToast,
  showToastPromise
};