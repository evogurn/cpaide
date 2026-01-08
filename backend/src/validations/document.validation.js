import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255),
  folderId: z.string().uuid('Invalid folder ID').optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const renameDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255, 'Document name too long'),
});

export const moveDocumentSchema = z.object({
  targetFolderId: z.string().uuid('Invalid target folder ID').nullable(),
});

export const searchDocumentsSchema = z.object({
  query: z.string().optional(),
  folderId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'READY', 'FAILED', 'ARCHIVED']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});
