import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(255, 'Folder name too long'),
  parentId: z.string().uuid('Invalid parent folder ID').nullable().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  metadata: z.record(z.any()).optional(),
});

export const renameFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(255, 'Folder name too long'),
});

export const moveFolderSchema = z.object({
  targetParentId: z.string().uuid('Invalid target folder ID').nullable(),
});
