import express from 'express';
import featureSliderController from '../controllers/featureSlider.controller.js';
import { authenticate as authenticateToken } from '../middlewares/auth.js';
import { requireRole as authorizeRole } from '../middlewares/rbac.js';

const router = express.Router();

/**
 * @route GET /api/feature-slider/slides
 * @desc Get all feature slider slides for the tenant
 * @access Private (Admin)
 */
router.get('/slides', authenticateToken, authorizeRole(['ADMIN']), featureSliderController.getSlides);

/**
 * @route GET /api/feature-slider/slides/enabled
 * @desc Get enabled feature slider slides for the tenant
 * @access Public
 */
router.get('/slides/enabled', featureSliderController.getEnabledSlides);

/**
 * @route POST /api/feature-slider/slides
 * @desc Create a new feature slider slide
 * @access Private (Admin)
 */
router.post('/slides', authenticateToken, authorizeRole(['ADMIN']), featureSliderController.createSlide);

/**
 * @route PUT /api/feature-slider/slides/:id
 * @desc Update a feature slider slide
 * @access Private (Admin)
 */
router.put('/slides/:id', authenticateToken, authorizeRole(['ADMIN']), featureSliderController.updateSlide);

/**
 * @route DELETE /api/feature-slider/slides/:id
 * @desc Delete a feature slider slide
 * @access Private (Admin)
 */
router.delete('/slides/:id', authenticateToken, authorizeRole(['ADMIN']), featureSliderController.deleteSlide);

/**
 * @route POST /api/feature-slider/slides/reorder
 * @desc Reorder feature slider slides
 * @access Private (Admin)
 */
router.post('/slides/reorder', authenticateToken, authorizeRole(['ADMIN']), featureSliderController.reorderSlides);

/**
 * @route POST /api/feature-slider/slides/init
 * @desc Initialize default slides for a tenant
 * @access Private (Admin)
 */
router.post('/slides/init', authenticateToken, authorizeRole(['ADMIN']), featureSliderController.initializeDefaultSlides);

export default router;