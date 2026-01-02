import express from 'express';
import aiController from '../controllers/ai.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { ragQuerySchema } from '../validations/ai.validation.js';
import { requirePermission } from '../middlewares/rbac.js';
import { PERMISSIONS } from '../constants/index.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/query',
  validateRequest(ragQuerySchema),
  requirePermission([PERMISSIONS.AI_QUERY]),
  aiController.ragQuery
);

router.post(
  '/reprocess/:documentId',
  requirePermission([PERMISSIONS.AI_MANAGE]),
  aiController.reprocessDocument
);

export default router;
