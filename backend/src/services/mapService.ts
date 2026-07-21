/**
 * src/services/mapService.ts
 *
 * Reads from DistrictStats and Report collections to build the
 * map markers, dashboard KPI summary, and district detail payloads.
 */

import { DistrictStats, IDistrictStats } from '../models/DistrictStats';
import { Report } from '../models/Report';
import { getConnectedClientCount } from './socketService';

export interface MapMarker {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  reportCount: number;
  hotspotScore: number;
  priorityLevel: string;
  severityIndex: number;
  latestIncident: Date | null;
  geminiRecommendation: string;
  geminiPriority: string;
  trend: string;
  criticalCount: number;
  verifiedCount: number;
}

export interface DashboardSummary {
  totalReports: number;
  criticalReports: number;
  verifiedReports: number;
  todayReports: number;
  topHotspot: { district: string; state: string; hotspotScore: number } | null;
  averageSeverity: number;
  activeDistricts: number;
  liveConnections: number;
}

/**
 * Builds the map markers array from all DistrictStats documents.
 */
export async function getMapMarkers(): Promise<MapMarker[]> {
  const districts = await DistrictStats.find({}).sort({ hotspotScore: -1 }).lean();

  return districts.map((d) => ({
    district:            d.district,
    state:               d.state,
    latitude:            d.latitude,
    longitude:           d.longitude,
    reportCount:         d.reportCount,
    hotspotScore:        d.hotspotScore,
    priorityLevel:       d.priorityLevel,
    severityIndex:       d.averageSeverity,
    latestIncident:      d.latestIncident ?? null,
    geminiRecommendation: d.geminiRecommendation,
    geminiPriority:      d.geminiPriority,
    trend:               d.trend,
    criticalCount:       d.criticalCount,
    verifiedCount:       d.verifiedCount,
  }));
}

/**
 * Returns the full dashboard KPI summary.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalReports, criticalReports, verifiedReports, todayReports, topHotspot, allDistricts] =
    await Promise.all([
      Report.countDocuments({}),
      Report.countDocuments({ severity: 'Critical' }),
      Report.countDocuments({ status: 'Verified' }),
      Report.countDocuments({ timestamp: { $gte: todayStart } }),
      DistrictStats.findOne({}).sort({ hotspotScore: -1 }).lean(),
      DistrictStats.find({}).lean(),
    ]);

  const averageSeverity =
    allDistricts.length > 0
      ? allDistricts.reduce((sum, d) => sum + d.averageSeverity, 0) / allDistricts.length
      : 1;

  const activeDistricts = allDistricts.filter((d) => d.reportCount > 0).length;

  return {
    totalReports,
    criticalReports,
    verifiedReports,
    todayReports,
    topHotspot: topHotspot
      ? { district: topHotspot.district, state: topHotspot.state, hotspotScore: topHotspot.hotspotScore }
      : null,
    averageSeverity: parseFloat(averageSeverity.toFixed(2)),
    activeDistricts,
    liveConnections: getConnectedClientCount(),
  };
}

/**
 * Returns full district details including recent reports.
 */
export async function getDistrictDetail(district: string): Promise<{
  stats: IDistrictStats | null;
  recentReports: unknown[];
  categoryBreakdown: unknown[];
}> {
  const [stats, recentReports, categoryAgg] = await Promise.all([
    DistrictStats.findOne({ district: new RegExp(district, 'i') }).lean(),
    Report.find({ district: new RegExp(district, 'i') })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(),
    Report.aggregate([
      { $match: { district: new RegExp(district, 'i') } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    stats,
    recentReports,
    categoryBreakdown: categoryAgg.map((x) => ({ category: x['_id'], count: x['count'] })),
  };
}

/**
 * Returns analytics data for charts.
 */
export async function getAnalyticsData(): Promise<{
  reportsOverTime: unknown[];
  categoryDistribution: unknown[];
  severityDistribution: unknown[];
  topDistricts: unknown[];
}> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [reportsOverTime, categoryDistribution, severityDistribution, topDistricts] =
    await Promise.all([
      Report.aggregate([
        { $match: { timestamp: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id': 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]),
      Report.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { category: '$_id', count: 1, _id: 0 } },
      ]),
      Report.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $project: { severity: '$_id', count: 1, _id: 0 } },
      ]),
      DistrictStats.find({}).sort({ hotspotScore: -1 }).limit(10).lean().then((ds) =>
        ds.map((d) => ({
          district: d.district,
          state: d.state,
          hotspotScore: d.hotspotScore,
          reportCount: d.reportCount,
        })),
      ),
    ]);

  return { reportsOverTime, categoryDistribution, severityDistribution, topDistricts };
}
