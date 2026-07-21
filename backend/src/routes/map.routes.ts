import { Router } from 'express';
import {
  handleGetDashboard,
  handleGetHotspots,
  handleGetMarkers,
  handleGetDistrict,
} from '../controllers/mapController';

const router = Router();

router.get('/dashboard', handleGetDashboard);
router.get('/hotspots', handleGetHotspots);
router.get('/markers', handleGetMarkers);
router.get('/district/:district', handleGetDistrict);

export default router;
