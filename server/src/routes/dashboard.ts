import { Router } from 'express';
import { getStats } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Dashboard stats
router.get('/stats', getStats);

export default router;