import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  roleIds: z.array(z.string().uuid()).optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  phone: z.string().optional(),
  phoneVerified: z.boolean().optional(),
  alternativePhone: z.string().optional(),
  timeZone: z.string().optional(),
  address: z.string().optional(),
});

export const assignRoleSchema = z.object({
  roleIds: z.array(z.string().uuid()).min(1, 'At least one role is required'),
});