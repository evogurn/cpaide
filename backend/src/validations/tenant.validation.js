import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  subdomain: z.string().min(3, 'Subdomain must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Subdomain must contain only lowercase letters, numbers, and hyphens'),
  domain: z.string().url('Invalid domain').optional(),
  settings: z.record(z.any()).optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().url().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']).optional(),
  settings: z.record(z.any()).optional(),
});
