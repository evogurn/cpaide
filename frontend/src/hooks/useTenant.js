import { useQuery } from '@tanstack/react-query';
import { getMyTenant, getCurrentUser } from '../services/tenantService';

/**
 * Custom hook to fetch current user's tenant information
 * @returns {Object} React Query result with tenant data
 */
export const useTenant = () => {
  return useQuery({
    queryKey: ['tenant'],
    queryFn: getMyTenant,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Custom hook to fetch current user profile
 * @returns {Object} React Query result with user data
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
};

export default {
  useTenant,
  useCurrentUser
};