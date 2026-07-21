import { Request, Response, NextFunction } from 'express';
import { getMapMarkers, getDashboardSummary, getDistrictDetail, getAnalyticsData } from '../services/mapService';
import { getAllHotspots } from '../services/hotspotService';
import { sendSuccess } from '../utils/responseFormatter';

export async function handleGetDashboard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [summary, markers, analytics] = await Promise.all([
      getDashboardSummary(),
      getMapMarkers(),
      getAnalyticsData(),
    ]);
    sendSuccess(res, { summary, markers, analytics });
  } catch (err) {
    next(err);
  }
}

export async function handleGetHotspots(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const hotspots = await getAllHotspots();
    sendSuccess(res, { hotspots, count: hotspots.length });
  } catch (err) {
    next(err);
  }
}

export async function handleGetMarkers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const markers = await getMapMarkers();
    sendSuccess(res, { markers, count: markers.length });
  } catch (err) {
    next(err);
  }
}

export async function handleGetDistrict(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const districtName = req.params['district'] as string;
    const detail = await getDistrictDetail(districtName);
    if (!detail.stats) {
      res.status(404).json({
        success: false,
        error: { code: 'DISTRICT_NOT_FOUND', message: `No data found for district: ${districtName}` },
      });
      return;
    }
    sendSuccess(res, detail);
  } catch (err) {
    next(err);
  }
}
