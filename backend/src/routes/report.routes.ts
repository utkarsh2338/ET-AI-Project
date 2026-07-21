import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleCreateReport,
  handleGetReports,
  handleGetReport,
} from '../controllers/reportController';

const router = Router();

// Stricter rate limit for report creation (20 reports per 5 minutes per IP)
const reportCreateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many report submissions. Please wait before submitting again.' } },
});

router.get('/', handleGetReports);
router.get('/:id', handleGetReport);
router.post('/', reportCreateLimiter, handleCreateReport);

export default router;
