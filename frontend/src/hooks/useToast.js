import { useMemo } from 'react';
import { toast } from 'sonner';
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showLoadingToast,
  dismissToast,
  showToastPromise
} from './toastUtils';

/**
 * Custom hook for using toast notifications
 * Provides a convenient way to access all toast utilities
 */
export const useToast = () => {
  return useMemo(() => ({
    success: showSuccessToast,
    error: showErrorToast,
    info: showInfoToast,
    warning: showWarningToast,
    loading: showLoadingToast,
    dismiss: dismissToast,
    promise: showToastPromise,
    // Direct access to sonner toast if needed
    toast
  }), []);
};

export default useToast;