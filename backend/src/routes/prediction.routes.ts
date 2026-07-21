import { Router } from 'express';
import {
  handlePredict,
  handleExtractFeatures,
  handleTranslate,
  handleMethodNotAllowed,
} from '../controllers/predictionController';

const router = Router();

router.post('/predict', handlePredict);
router.all('/predict', handleMethodNotAllowed);
router.post('/extract-features', handleExtractFeatures);
router.all('/extract-features', handleMethodNotAllowed);
router.post('/translate', handleTranslate);
router.all('/translate', handleMethodNotAllowed);

export default router;

