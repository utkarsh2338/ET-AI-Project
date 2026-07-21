import { Router } from 'express';
import {
  handlePredict,
  handleExtractFeatures,
  handleMethodNotAllowed,
} from '../controllers/predictionController';

const router = Router();

router.post('/predict', handlePredict);
router.all('/predict', handleMethodNotAllowed);
router.post('/extract-features', handleExtractFeatures);
router.all('/extract-features', handleMethodNotAllowed);

export default router;
