import express from 'express';
import authRoutes from './auth.routes.js';
import otpRoutes from './otp.routes.js';
import userRoutes from './user.routes.js';
import tenantRoutes from './tenant.routes.js';
import folderRoutes from './folder.routes.js';
import documentRoutes from './document.routes.js';
import documentUploadRoutes from './document-upload.routes.js';
import documentDownloadRoutes from './document-download.routes.js';
import featureSliderRoutes from './featureSlider.routes.js';
import aiRoutes from './ai.routes.js';
import projectLabelRoutes from './projectLabel.routes.js';
import loginHistoryRoutes from './loginHistory.routes.js';
import adminRoutes from './admin.routes.js';
import billingRoutes from './billing.routes.js';
import folderTemplateRoutes from './folder-template.routes.js';
import notificationRoutes from './notification.routes.js';
import supportTicketRoutes from './supportTicket.routes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/auth', authRoutes);
router.use('/auth/otp', otpRoutes); // Add OTP routes
router.use('/users', userRoutes);
router.use('/tenants', tenantRoutes);
router.use('/folders', folderRoutes);
router.use('/documents', documentRoutes);
router.use('/document-upload', documentUploadRoutes);
router.use('/document-download', documentDownloadRoutes);
router.use('/feature-slider', featureSliderRoutes);
router.use('/ai', aiRoutes);
router.use('/project-label', projectLabelRoutes);
router.use('/login-history', loginHistoryRoutes);
router.use('/admin', adminRoutes);
router.use('/billing', billingRoutes);
router.use('/folder-templates', folderTemplateRoutes);
router.use('/notifications', notificationRoutes);
router.use('/support-tickets', supportTicketRoutes);

export default router;