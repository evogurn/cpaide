import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { folderService } from '../services/folderService';

export const useFolderTree = () => {
  return useQuery({
    queryKey: ['folderTree'],
    queryFn: () => folderService.getFolderTree(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderData) => folderService.createFolder(folderData),
    onMutate: async (newFolderData) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['folderTree'] });
      
      // Snapshot the previous value
      const previousFolders = queryClient.getQueryData(['folderTree']);
      
      // Optimistically add the new folder
      const optimisticFolder = {
        id: `temp-${Date.now()}`,
        name: newFolderData.name,
        parentId: newFolderData.parentId,
        children: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          documents: 0,
          children: 0,
        },
        owner: {
          id: 'current-user', // This will be updated after API call
          firstName: 'Current',
          lastName: 'User',
          email: 'current@user.com',
        }
      };
      
      // Update the query data optimistically
      queryClient.setQueryData(['folderTree'], (old) => {
        if (!old) return [];
        
        // If parentId is null, add to root level
        if (!newFolderData.parentId) {
          return [...old, optimisticFolder];
        } else {
          // Find the parent folder and add the new folder to its children
          const addFolderToParent = (folders) => {
            return folders.map(folder => {
              if (folder.id === newFolderData.parentId) {
                return {
                  ...folder,
                  children: [...folder.children, optimisticFolder],
                };
              }
              if (folder.children && folder.children.length > 0) {
                return {
                  ...folder,
                  children: addFolderToParent(folder.children),
                };
              }
              return folder;
            });
          };
          
          return addFolderToParent(old);
        }
      });
      
      // Return context object with the previous value
      return { previousFolders };
    },
    onError: (err, newFolderData, context) => {
      // Rollback to the previous value if the mutation fails
      queryClient.setQueryData(['folderTree'], context.previousFolders);
    },
    onSuccess: (newFolder) => {
      // Invalidate and refetch the folder tree to update with server data
      queryClient.invalidateQueries({ queryKey: ['folderTree'] });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, updateData }) => folderService.updateFolder(folderId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderTree'] });
    },
  });
};



export const useMoveFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, targetParentId }) => folderService.moveFolder(folderId, targetParentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderTree'] });
    },
  });
};

export const useRenameFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, name }) => folderService.renameFolder(folderId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderTree'] });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId) => folderService.deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderTree'] });
    },
  });
};