import express from 'express';
import multer from 'multer';
import documentUploadController from '../controllers/document-upload.controller.js';
import { authenticate } from '../middlewares/auth.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Generate presigned URL for document upload - requires authentication
router.post('/upload-url', authenticate, documentUploadController.getUploadUrl);

// Validate upload request - requires authentication
router.post('/validate', authenticate, documentUploadController.validateUpload);

// Direct file upload - requires authentication
router.post('/direct-upload', authenticate, upload.single('file'), documentUploadController.directUpload);

export default router;