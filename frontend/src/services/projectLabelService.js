import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';

/**
 * Project Label Service
 * Handles API calls for project label settings
 */

/**
 * Get the current project label for the tenant
 * @returns {Promise<string>} The project label
 */
export const getProjectLabel = async () => {
  try {
    const response = await api.get('/project-label');
    return response.data.data.label;
  } catch (error) {
    console.error('Error fetching project label:', error);
    throw error;
  }
};

/**
 * Update the project label for the tenant
 * @param {string} label - The new project label
 * @returns {Promise<string>} The updated project label
 */
export const updateProjectLabel = async (label) => {
  try {
    const response = await api.put('/project-label', { label });
    return response.data.data.label;
  } catch (error) {
    console.error('Error updating project label:', error);
    throw error;
  }
};

/**
 * Custom hook for fetching project label with TanStack Query
 * @returns {Object} Query result object from useQuery
 */
export const useProjectLabel = () => {
  return useQuery({
    queryKey: ['projectLabel'],
    queryFn: getProjectLabel,
  });
};

/**
 * Custom hook for updating project label with TanStack Query
 * @param {Function} onSuccessCallback - Callback function to execute on successful update
 * @returns {Object} Mutation result object from useMutation
 */
export const useUpdateProjectLabel = (onSuccessCallback) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProjectLabel,
    onSuccess: (newLabel) => {
      // Update the cache with the new label
      queryClient.setQueryData(['projectLabel'], newLabel);
      // Show success toast
      toast.success('Project label updated successfully!');
      // Call the callback function if provided
      if (onSuccessCallback) {
        onSuccessCallback(newLabel);
      }
    },
    onError: (error) => {
      console.error('Error updating project label:', error);
      // Show error toast with message from backend if available
      const errorMessage = error.response?.data?.message || 'Failed to update project label. Please try again.';
      toast.error(errorMessage);
    }
  });
};