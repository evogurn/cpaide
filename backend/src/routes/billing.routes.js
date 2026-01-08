import express from 'express';
import { 
  getAvailableBillingPlans
} from '../controllers/admin.controller.js';

const router = express.Router();

// Public billing endpoints (no authentication required)
router.get('/plans', getAvailableBillingPlans);

export default router;