import express from 'express';
import documentController from '../controllers/document.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { uploadDocumentSchema, updateDocumentSchema, moveDocumentSchema, renameDocumentSchema } from '../validations/document.validation.js';
import { requirePermission } from '../middlewares/rbac.js';
import { PERMISSIONS } from '../constants/index.js';
import { uploadLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get pre-signed upload URL
router.post(
  '/upload-url',
  uploadLimiter,
  requirePermission([PERMISSIONS.DOCUMENT_CREATE]),
  documentController.getUploadUrl
);

// CRUD operations
router.post(
  '/',
  validateRequest(uploadDocumentSchema),
  requirePermission([PERMISSIONS.DOCUMENT_CREATE]),
  documentController.createDocument
);

router.get(
  '/',
  requirePermission([PERMISSIONS.DOCUMENT_READ]),
  documentController.listDocuments
);

router.get(
  '/search',
  requirePermission([PERMISSIONS.DOCUMENT_READ]),
  documentController.searchDocuments
);

router.get(
  '/:id',
  requirePermission([PERMISSIONS.DOCUMENT_READ]),
  documentController.getDocument
);

router.get(
  '/:id/download',
  requirePermission([PERMISSIONS.DOCUMENT_READ]),
  documentController.getDownloadUrl
);

router.patch(
  '/:id',
  validateRequest(updateDocumentSchema),
  requirePermission([PERMISSIONS.DOCUMENT_UPDATE]),
  documentController.updateDocument
);

router.patch(
  '/:id/rename',
  validateRequest(renameDocumentSchema),
  requirePermission([PERMISSIONS.DOCUMENT_UPDATE]),
  documentController.renameDocument
);

router.post(
  '/:id/move',
  validateRequest(moveDocumentSchema),
  requirePermission([PERMISSIONS.DOCUMENT_UPDATE]),
  documentController.moveDocument
);

router.delete(
  '/:id',
  requirePermission([PERMISSIONS.DOCUMENT_DELETE]),
  documentController.deleteDocument
);

router.post(
  '/:id/restore',
  requirePermission([PERMISSIONS.DOCUMENT_UPDATE]),
  documentController.restoreDocument
);

export default router;
