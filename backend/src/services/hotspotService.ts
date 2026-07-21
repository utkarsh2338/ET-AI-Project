/**
 * src/services/hotspotService.ts
 *
 * Orchestrates the geospatial aggregation pipeline.
 * Reads from the Report collection, recalculates hotspot metrics
 * for a given district, and writes the result to DistrictStats.
 */

import { Report } from '../models/Report';
import { DistrictStats, IDistrictStats } from '../models/DistrictStats';
import {
  calculateHotspotScore,
  calculateTrend,
  getPriorityLevel,
} from './scoringService';
import { resolveDistrictCoordinates } from './coordinateService';
import { logger } from '../utils/logger';

/**
 * Full aggregation pipeline for a single district.
 * Returns the updated DistrictStats document.
 */
export async function recalculateDistrict(
  district: string,
  state: string,
): Promise<IDistrictStats | null> {
  const start = Date.now();

  // ── Aggregation ──────────────────────────────────────────────
  const [agg] = await Report.aggregate([
    { $match: { district, state } },
    {
      $group: {
        _id: null,
        reportCount:     { $sum: 1 },
        verifiedCount:   { $sum: { $cond: [{ $eq: ['$status', 'Verified'] }, 1, 0] } },
        criticalCount:   { $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] } },
        latestIncident:  { $max: '$timestamp' },
        avgSeverityNum:  {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ['$severity', 'Low'] },      then: 1 },
                { case: { $eq: ['$severity', 'Medium'] },   then: 2 },
                { case: { $eq: ['$severity', 'High'] },     then: 3 },
                { case: { $eq: ['$severity', 'Critical'] }, then: 4 },
              ],
              default: 1,
            },
          },
        },
      },
    },
  ]);

  if (!agg && !(await DistrictStats.exists({ district, state }))) {
    return null;
  }

  // ── Trend: current week vs previous week ─────────────────────
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const currentWeekCount = await Report.countDocuments({
    district, state, timestamp: { $gte: weekAgo },
  });
  const previousWeekCount = await Report.countDocuments({
    district, state, timestamp: { $gte: twoWeeksAgo, $lt: weekAgo },
  });

  const trend = calculateTrend(currentWeekCount, previousWeekCount);

  // ── Score & Coordinates ───────────────────────────────────────
  const reportCount    = agg?.reportCount ?? 0;
  const averageSeverity = agg?.avgSeverityNum ?? 1;
  const latestIncident  = agg?.latestIncident ?? null;

  const hotspotScore  = calculateHotspotScore(reportCount, averageSeverity, latestIncident);
  const priorityLevel = getPriorityLevel(hotspotScore);
  const coords        = resolveDistrictCoordinates(district, state);

  // ── Upsert DistrictStats ──────────────────────────────────────
  const updated = await DistrictStats.findOneAndUpdate(
    { district, state },
    {
      $set: {
        latitude:       coords.latitude,
        longitude:      coords.longitude,
        reportCount,
        verifiedCount:  agg?.verifiedCount ?? 0,
        criticalCount:  agg?.criticalCount ?? 0,
        averageSeverity,
        hotspotScore,
        priorityLevel,
        latestIncident,
        trend,
        lastCalculated: new Date(),
      },
    },
    { returnDocument: 'after', upsert: true },
  );

  logger.info('Hotspot recalculated', {
    district, state, hotspotScore, priorityLevel, latencyMs: Date.now() - start,
  });

  return updated;
}

/**
 * Returns all DistrictStats sorted by hotspot score descending.
 */
export async function getAllHotspots(limit = 200): Promise<IDistrictStats[]> {
  return DistrictStats.find({}).sort({ hotspotScore: -1 }).limit(limit).lean();
}

/**
 * Returns the top N hotspot districts.
 */
export async function getTopHotspots(n = 10): Promise<IDistrictStats[]> {
  return DistrictStats.find({}).sort({ hotspotScore: -1 }).limit(n).lean();
}

/**
 * Returns a single district's stats.
 */
export async function getDistrictStats(
  district: string,
  state?: string,
): Promise<IDistrictStats | null> {
  const query = state ? { district, state } : { district };
  return DistrictStats.findOne(query).lean();
}
