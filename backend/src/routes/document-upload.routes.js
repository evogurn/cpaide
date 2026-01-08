import express from 'express';
import documentUploadController from '../controllers/document-upload.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Generate presigned URL for document upload - requires authentication
router.post('/upload-url', authenticate, documentUploadController.getUploadUrl);

// Validate upload request - requires authentication
router.post('/validate', authenticate, documentUploadController.validateUpload);

export default router;