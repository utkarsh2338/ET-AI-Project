import { Router } from 'express';
import healthRoutes from './health.routes';
import predictionRoutes from './prediction.routes';
import reportRoutes from './report.routes';
import mapRoutes from './map.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/', predictionRoutes);
router.use('/reports', reportRoutes);
router.use('/', mapRoutes);

export default router;
