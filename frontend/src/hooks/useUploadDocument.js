import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/documentService';

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, title, description, tags, folderId }) => 
      documentService.uploadDocument({ file, title, description, tags, folderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderTree'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};