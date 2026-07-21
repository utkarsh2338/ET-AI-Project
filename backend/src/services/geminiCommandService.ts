/**
 * src/services/geminiCommandService.ts
 *
 * Gemini integration for the Command Center recommendation engine.
 * Gemini receives ONLY pre-computed backend statistics — never raw text.
 * This keeps the system auditable and explainable.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { IDistrictStats } from '../models/DistrictStats';
import { logger } from '../utils/logger';

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) _genAI = new GoogleGenerativeAI(config.geminiApiKey);
  return _genAI;
}

export interface DistrictRecommendation {
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
}

const FALLBACK_RECOMMENDATIONS: Record<string, DistrictRecommendation> = {
  Critical: {
    priority: 'Critical',
    recommendation:
      'Immediate enforcement action required. Deploy cyber patrol units, issue district-wide citizen advisories, and coordinate with financial institutions to freeze suspicious accounts.',
  },
  High: {
    priority: 'High',
    recommendation:
      'Elevated fraud activity detected. Increase monitoring frequency, conduct awareness campaigns at banks and post offices, and escalate verified cases to state cybercrime cell.',
  },
  Medium: {
    priority: 'Medium',
    recommendation:
      'Moderate fraud activity observed. Maintain standard monitoring protocols, schedule awareness workshops, and track trends weekly.',
  },
  Low: {
    priority: 'Low',
    recommendation:
      'Low fraud activity. Continue routine monitoring and community outreach programs.',
  },
};

function buildCommandPrompt(stats: IDistrictStats): string {
  const severityLabel = ['', 'Low', 'Medium', 'High', 'Critical'][
    Math.round(stats.averageSeverity)
  ] ?? 'Medium';

  return `You are an expert cybercrime analyst advising Indian law enforcement.

The backend has already computed the following hotspot statistics for ${stats.district}, ${stats.state}.
Do NOT invent new data — base your recommendation ONLY on the supplied figures.

DISTRICT STATISTICS:
- District: ${stats.district}, ${stats.state}
- Total Reports: ${stats.reportCount}
- Critical Reports: ${stats.criticalCount}
- Verified Reports: ${stats.verifiedCount}
- Average Severity: ${severityLabel} (${stats.averageSeverity.toFixed(2)}/4.0)
- Hotspot Score: ${stats.hotspotScore}/100
- Priority Level: ${stats.priorityLevel}
- Trend: ${stats.trend}
- Latest Incident: ${stats.latestIncident ? new Date(stats.latestIncident).toLocaleDateString('en-IN') : 'N/A'}

Generate a concise enforcement recommendation. Explain why this district has been prioritized.

Respond with valid JSON only, in this exact format:
{
  "priority": "<Low|Medium|High|Critical>",
  "recommendation": "<2-3 sentence enforcement recommendation>"
}`;
}

function validateResponse(raw: unknown): DistrictRecommendation {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid Gemini response structure');
  }
  const obj = raw as Record<string, unknown>;
  const priority = obj['priority'];
  const recommendation = obj['recommendation'];

  if (!['Low', 'Medium', 'High', 'Critical'].includes(priority as string)) {
    throw new Error(`Invalid priority: ${priority}`);
  }
  if (typeof recommendation !== 'string' || recommendation.length < 10) {
    throw new Error('Invalid recommendation string');
  }

  return {
    priority: priority as DistrictRecommendation['priority'],
    recommendation: recommendation as string,
  };
}

/**
 * Generates an AI-powered law enforcement recommendation for a district.
 * Falls back to a pre-computed recommendation if Gemini times out or fails.
 */
export async function generateRecommendation(
  stats: IDistrictStats,
): Promise<DistrictRecommendation> {
  const start = Date.now();

  try {
    const model = getGenAI().getGenerativeModel({ model: config.model });
    const prompt = buildCommandPrompt(stats);

    const resultPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini timeout')), config.geminiTimeoutMs),
    );

    const result = await Promise.race([resultPromise, timeoutPromise]);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonStr) as unknown;
    const validated = validateResponse(parsed);

    logger.info('Gemini recommendation generated', {
      district: stats.district,
      priority: validated.priority,
      latencyMs: Date.now() - start,
    });

    return validated;
  } catch (err) {
    logger.warn('Gemini recommendation failed — using fallback', {
      district: stats.district,
      error: String(err),
    });
    return FALLBACK_RECOMMENDATIONS[stats.priorityLevel] ?? FALLBACK_RECOMMENDATIONS['Low']!;
  }
}
