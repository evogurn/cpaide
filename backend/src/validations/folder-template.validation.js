import { z } from 'zod';
import { validateRequest } from '../middlewares/validate.js';

// Validation for creating a folder template
export const createFolderTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255, 'Template name must not exceed 255 characters'),
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry must not exceed 100 characters'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  nodes: z.array(
    z.object({
      name: z.string().min(1, 'Each node must have a name'),
      level: z.number().int().min(0, 'Node level must be a non-negative integer').optional().default(0),
      position: z.number().int().min(0, 'Node position must be a non-negative integer').optional().default(0),
      parentId: z.string().uuid().nullable().optional(),
      isPlaceholder: z.boolean().optional().default(false),
      metadata: z.record(z.any()).optional().nullable(),
    })
  ).min(1, 'Template must have at least one node'),
});

const createTemplateValidation = [validateRequest(createFolderTemplateSchema)];

// Validation for updating a folder template
export const updateTemplateParamsSchema = z.object({
  id: z.string().uuid('Template ID is required'),
});

export const updateTemplateBodySchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255, 'Template name must not exceed 255 characters').optional(),
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry must not exceed 100 characters').optional(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  isActive: z.boolean().optional(),
  nodes: z.array(
    z.object({
      name: z.string().min(1, 'Each node must have a name'),
      level: z.number().int().min(0, 'Node level must be a non-negative integer').optional().default(0),
      position: z.number().int().min(0, 'Node position must be a non-negative integer').optional().default(0),
      parentId: z.string().uuid().nullable().optional(),
      isPlaceholder: z.boolean().optional().default(false),
      metadata: z.record(z.any()).optional().nullable(),
    })
  ).optional(),
});

const updateTemplateValidation = [
  validateRequest(updateTemplateParamsSchema, 'params'),
  validateRequest(updateTemplateBodySchema, 'body')
];

// Validation for getting templates
export const getTemplatesQuerySchema = z.object({
  industry: z.string().max(100, 'Industry must not exceed 100 characters').optional(),
  isActive: z.preprocess((val) => val === 'true', z.boolean()).optional(),
  isSystem: z.preprocess((val) => val === 'true', z.boolean()).optional(),
  page: z.preprocess((val) => {
    const parsed = parseInt(val);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().int().min(1).optional().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val);
    return isNaN(parsed) ? 20 : parsed;
  }, z.number().int().min(1).max(100).optional().default(20)),
});

const getTemplatesValidation = [validateRequest(getTemplatesQuerySchema, 'query')];

// Validation for getting template by ID
export const getTemplateByIdParamsSchema = z.object({
  id: z.string().uuid('Template ID is required'),
});

const getTemplateByIdValidation = [validateRequest(getTemplateByIdParamsSchema, 'params')];

// Validation for deleting a template
export const deleteTemplateParamsSchema = z.object({
  id: z.string().uuid('Template ID is required'),
});

const deleteTemplateValidation = [validateRequest(deleteTemplateParamsSchema, 'params')];

// Validation for applying a template to a tenant
export const applyTemplateParamsSchema = z.object({
  id: z.string().uuid('Template ID is required'),
});

export const applyTemplateBodySchema = z.object({
  placeholderValues: z.record(z.string()).optional().default({}),
});

const applyTemplateValidation = [
  validateRequest(applyTemplateParamsSchema, 'params'),
  validateRequest(applyTemplateBodySchema, 'body')
];

// Validation for getting templates by industry
export const getTemplatesByIndustryParamsSchema = z.object({
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry must not exceed 100 characters'),
});

const getTemplatesByIndustryValidation = [validateRequest(getTemplatesByIndustryParamsSchema, 'params')];

export {
  createTemplateValidation,
  updateTemplateValidation,
  getTemplatesValidation,
  getTemplateByIdValidation,
  deleteTemplateValidation,
  applyTemplateValidation,
  getTemplatesByIndustryValidation,
};
