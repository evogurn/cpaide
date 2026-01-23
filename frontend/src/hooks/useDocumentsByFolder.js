import { useQuery } from '@tanstack/react-query';
import { documentService } from '../services/documentService';

export const useDocumentsByFolder = (folderId = null) => {
  return useQuery({
    queryKey: ['documents', { folderId }],
    queryFn: () => documentService.getDocumentsByFolder(folderId),
    enabled: true, // Always enabled
  });
};