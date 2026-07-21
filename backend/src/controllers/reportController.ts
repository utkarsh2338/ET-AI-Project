import { Request, Response, NextFunction } from 'express';
import { createReport, getReports, getReportById, CreateReportDTO, ReportFilters } from '../services/reportService';
import { sendSuccess, sendError } from '../utils/responseFormatter';
import { ValidationError } from '../utils/errorHandler';

const VALID_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const VALID_CATEGORIES = [
  'UPI Fraud', 'Banking Fraud', 'OTP Scam', 'Phishing', 'Lottery Scam',
  'Job Fraud', 'Investment Scam', 'KYC Scam', 'Impersonation', 'Other',
];

function validateCreateReport(body: unknown): CreateReportDTO {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be a JSON object.');
  }
  const b = body as Record<string, unknown>;

  if (!b['title'] || typeof b['title'] !== 'string' || b['title'].trim().length < 3) {
    throw new ValidationError('Field "title" must be at least 3 characters.');
  }
  if (!b['description'] || typeof b['description'] !== 'string' || b['description'].trim().length < 10) {
    throw new ValidationError('Field "description" must be at least 10 characters.');
  }
  if (!b['district'] || typeof b['district'] !== 'string') {
    throw new ValidationError('Field "district" is required.');
  }
  if (!b['state'] || typeof b['state'] !== 'string') {
    throw new ValidationError('Field "state" is required.');
  }
  if (typeof b['latitude'] !== 'number' || b['latitude'] < 6 || b['latitude'] > 38) {
    throw new ValidationError('Field "latitude" must be a number between 6 and 38 (India range).');
  }
  if (typeof b['longitude'] !== 'number' || b['longitude'] < 68 || b['longitude'] > 98) {
    throw new ValidationError('Field "longitude" must be a number between 68 and 98 (India range).');
  }
  if (!b['severity'] || !VALID_SEVERITIES.includes(b['severity'] as string)) {
    throw new ValidationError(`Field "severity" must be one of: ${VALID_SEVERITIES.join(', ')}.`);
  }

  const category = (b['category'] as string) ?? 'Other';
  if (!VALID_CATEGORIES.includes(category)) {
    throw new ValidationError(`Field "category" must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }

  return {
    title:       (b['title'] as string).trim(),
    description: (b['description'] as string).trim(),
    category,
    district:    (b['district'] as string).trim(),
    state:       (b['state'] as string).trim(),
    latitude:    b['latitude'] as number,
    longitude:   b['longitude'] as number,
    severity:    b['severity'] as string,
    source:      (b['source'] as string | undefined) ?? 'Citizen',
    scamPrediction: b['scamPrediction'] as string | undefined,
    confidence:  b['confidence'] as number | undefined,
  };
}

export async function handleCreateReport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = validateCreateReport(req.body);
    const report = await createReport(dto);
    sendSuccess(res, { reportId: report.reportId, status: report.status, message: 'Report submitted successfully.' }, 201);
  } catch (err) {
    if ((err as Record<string, unknown>)['code'] === 'DUPLICATE_REPORT') {
      sendError(res, 409, 'DUPLICATE_REPORT', (err as Error).message);
      return;
    }
    next(err);
  }
}

export async function handleGetReports(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page  = Math.max(1, parseInt(req.query['page'] as string ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string ?? '20', 10)));

    const filters: ReportFilters = {
      state:     req.query['state'] as string | undefined,
      district:  req.query['district'] as string | undefined,
      severity:  req.query['severity'] as string | undefined,
      status:    req.query['status'] as string | undefined,
      category:  req.query['category'] as string | undefined,
      startDate: req.query['startDate'] as string | undefined,
      endDate:   req.query['endDate'] as string | undefined,
      search:    req.query['search'] as string | undefined,
    };

    const result = await getReports(filters, page, limit);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetReport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const report = await getReportById(req.params['id'] as string);
    if (!report) {
      sendError(res, 404, 'REPORT_NOT_FOUND', `No report found with id: ${req.params['id']}`);
      return;
    }
    sendSuccess(res, report);
  } catch (err) {
    next(err);
  }
}
