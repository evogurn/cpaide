import express from 'express';
import authRoutes from './auth.routes.js';
import otpRoutes from './otp.routes.js';
import userRoutes from './user.routes.js';
import tenantRoutes from './tenant.routes.js';
import tenantSettingsRoutes from './tenantSettings.routes.js';
import folderRoutes from './folder.routes.js';
import documentRoutes from './document.routes.js';
import featureSliderRoutes from './featureSlider.routes.js';
import aiRoutes from './ai.routes.js';
import projectLabelRoutes from './projectLabel.routes.js';

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
router.use('/tenant-settings', tenantSettingsRoutes);
router.use('/folders', folderRoutes);
router.use('/documents', documentRoutes);
router.use('/feature-slider', featureSliderRoutes);
router.use('/ai', aiRoutes);
router.use('/project-label', projectLabelRoutes);

export default router;