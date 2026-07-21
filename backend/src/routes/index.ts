import { Router } from 'express';
import healthRoutes from './health.routes';
import predictionRoutes from './prediction.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/', predictionRoutes);

export default router;
