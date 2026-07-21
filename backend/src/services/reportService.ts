/**
 * src/services/reportService.ts
 *
 * Handles report creation, deduplication, querying, and the
 * post-creation pipeline (hotspot recalculation → Gemini → broadcast).
 */

import crypto from 'crypto';
import { Report, IReport } from '../models/Report';
import { DistrictStats } from '../models/DistrictStats';
import { recalculateDistrict } from './hotspotService';
import { generateRecommendation } from './geminiCommandService';
import { broadcastNewReport, broadcastHotspotUpdate } from './socketService';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export interface CreateReportDTO {
  title: string;
  description: string;
  category: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  severity: string;
  source?: string;
  scamPrediction?: string;
  confidence?: number;
}

export interface ReportFilters {
  state?: string;
  district?: string;
  severity?: string;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Generates a content hash for deduplication.
 * Two reports with the same district + description within the dedup window
 * will be flagged as duplicates.
 */
function generateContentHash(dto: CreateReportDTO): string {
  const key = `${dto.district.toLowerCase()}:${dto.description.toLowerCase().slice(0, 100)}`;
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Generates a unique report ID in the format CFS-XXXXXX-YY.
 */
function generateReportId(): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const suffix = Date.now().toString(36).slice(-2).toUpperCase();
  return `CFS-${rand}-${suffix}`;
}

/**
 * Creates a new fraud report, runs the full post-creation pipeline:
 * 1. Deduplication check
 * 2. Persist to MongoDB
 * 3. Recalculate district hotspot score
 * 4. Generate Gemini recommendation
 * 5. Broadcast via Socket.IO
 */
export async function createReport(dto: CreateReportDTO): Promise<IReport> {
  const dbStart = Date.now();

  // ── Deduplication ─────────────────────────────────────────────
  const contentHash = generateContentHash(dto);
  const dedupWindowMs = config.dedupWindowSeconds * 1000;
  const recentDuplicate = await Report.findOne({
    contentHash,
    timestamp: { $gte: new Date(Date.now() - dedupWindowMs) },
  });
  if (recentDuplicate) {
    throw Object.assign(new Error('Duplicate report detected within deduplication window.'), {
      code: 'DUPLICATE_REPORT',
      statusCode: 409,
    });
  }

  // ── Persist ───────────────────────────────────────────────────
  const report = new Report({
    reportId: generateReportId(),
    ...dto,
    timestamp: new Date(),
    status: 'Pending',
    source: dto.source ?? 'Citizen',
    contentHash,
  });
  await report.save();
  logger.info('Report saved', { reportId: report.reportId, dbMs: Date.now() - dbStart });

  // ── Async pipeline (non-blocking for the HTTP response) ───────
  setImmediate(() => {
    void runPostCreationPipeline(report);
  });

  return report;
}

async function runPostCreationPipeline(report: IReport): Promise<void> {
  try {
    // 1. Recalculate hotspot
    const hotspotStart = Date.now();
    const districtStats = await recalculateDistrict(report.district, report.state);
    logger.info('Hotspot pipeline', { latencyMs: Date.now() - hotspotStart });

    if (!districtStats) return;

    // 2. Generate Gemini recommendation
    const geminiStart = Date.now();
    const rec = await generateRecommendation(districtStats);
    logger.info('Gemini recommendation', { latencyMs: Date.now() - geminiStart });

    // 3. Save recommendation back to DistrictStats
    await DistrictStats.updateOne(
      { district: report.district, state: report.state },
      { $set: { geminiRecommendation: rec.recommendation, geminiPriority: rec.priority } },
    );

    // 4. Broadcast via Socket.IO
    const broadcastStart = Date.now();
    const statsPlain = (districtStats.toObject?.() ?? districtStats) as unknown as Record<string, unknown>;
    broadcastNewReport({
      report: report.toObject() as Record<string, unknown>,
      districtStats: { ...statsPlain, geminiRecommendation: rec.recommendation, geminiPriority: rec.priority },
      recommendation: rec as unknown as Record<string, unknown>,
    });
    broadcastHotspotUpdate({ ...statsPlain, geminiRecommendation: rec.recommendation });
    logger.info('Broadcast sent', { latencyMs: Date.now() - broadcastStart });
  } catch (err) {
    logger.error('Post-creation pipeline error', { error: String(err) });
  }
}

/**
 * Paginated report query with optional filters.
 */
export async function getReports(
  filters: ReportFilters,
  page = 1,
  limit = 20,
): Promise<{ reports: IReport[]; total: number; page: number; pages: number }> {
  const query: Record<string, unknown> = {};

  if (filters.state)    query['state'] = new RegExp(filters.state, 'i');
  if (filters.district) query['district'] = new RegExp(filters.district, 'i');
  if (filters.severity) query['severity'] = filters.severity;
  if (filters.status)   query['status'] = filters.status;
  if (filters.category) query['category'] = filters.category;

  if (filters.startDate || filters.endDate) {
    const ts: Record<string, Date> = {};
    if (filters.startDate) ts['$gte'] = new Date(filters.startDate);
    if (filters.endDate)   ts['$lte'] = new Date(filters.endDate);
    query['timestamp'] = ts;
  }

  if (filters.search) {
    query['$or'] = [
      { title:       { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { district:    { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [reports, total] = await Promise.all([
    Report.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    Report.countDocuments(query),
  ]);

  return { reports: reports as IReport[], total, page, pages: Math.ceil(total / limit) };
}

/**
 * Returns a single report by its reportId or MongoDB _id.
 */
export async function getReportById(id: string): Promise<IReport | null> {
  const report = await Report.findOne({ reportId: id }).lean();
  if (report) return report as IReport;
  return Report.findById(id).lean() as Promise<IReport | null>;
}
