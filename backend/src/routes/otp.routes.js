import express from 'express';
import otpController from '../controllers/otp.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import { initiateOtpSchema, verifyOtpSchema, resendOtpSchema } from '../validations/otp.validation.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/initiate', authLimiter, validateRequest(initiateOtpSchema), otpController.initiateOtp);
router.post('/verify', authLimiter, validateRequest(verifyOtpSchema), otpController.verifyOtp);
router.post('/resend', authLimiter, validateRequest(resendOtpSchema), otpController.resendOtp);

export default router;