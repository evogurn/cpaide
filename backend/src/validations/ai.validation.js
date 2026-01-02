import { z } from 'zod';

export const ragQuerySchema = z.object({
  query: z.string().min(1, 'Query is required').max(1000, 'Query too long'),
  folderId: z.string().uuid('Invalid folder ID').optional(),
  limit: z.number().int().positive().max(20).default(5),
  minScore: z.number().min(0).max(1).default(0.7),
});
