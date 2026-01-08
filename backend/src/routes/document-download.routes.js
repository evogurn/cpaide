import express from 'express';
import documentDownloadController from '../controllers/document-download.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Generate presigned download URL - requires authentication
router.get('/download-url/:documentId', authenticate, documentDownloadController.getDownloadUrl);

// Validate document access - requires authentication
router.get('/validate/:documentId', authenticate, documentDownloadController.validateAccess);

export default router;