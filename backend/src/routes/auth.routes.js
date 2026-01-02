import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import { loginSchema, registerSchema, refreshTokenSchema, tenantRegisterSchema } from '../validations/auth.validation.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/register/tenant', authLimiter, validateRequest(tenantRegisterSchema), authController.registerTenant);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;