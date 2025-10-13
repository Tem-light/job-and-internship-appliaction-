import express from 'express';
import { getAdminStats } from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAdminStats);

export default router;
