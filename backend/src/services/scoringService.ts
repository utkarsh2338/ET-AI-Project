/**
 * src/services/scoringService.ts
 *
 * Pure, deterministic scoring functions for the hotspot algorithm.
 * No side-effects, no database calls — all independently unit-testable.
 *
 * Hotspot Score = Density × 0.5 + Severity × 0.3 + Recency × 0.2
 * Final score is normalized to 0–100.
 */

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

// Baseline report count used for density normalization (95th-percentile approximation)
const DENSITY_BASELINE = 500;

// Severity weight map: maps averageSeverity (1–4) to 0–100 scale
const SEVERITY_WEIGHT_MAP: Record<number, number> = {
  1: 20,   // Low
  2: 45,   // Medium
  3: 75,   // High
  4: 100,  // Critical
};

/**
 * Converts total report count to a 0–100 density score.
 * Uses a log-normalised approach so a single-report district
 * doesn't score 0 and a 500-report district scores ~100.
 */
export function calculateDensityScore(count: number, baseline: number = DENSITY_BASELINE): number {
  if (count <= 0) return 0;
  const raw = Math.log1p(count) / Math.log1p(baseline);
  return Math.min(100, Math.round(raw * 100));
}

/**
 * Converts averageSeverity (1.0–4.0 float) to a 0–100 severity score.
 * Interpolates linearly between severity buckets.
 */
export function calculateSeverityScore(averageSeverity: number): number {
  const clamped = Math.max(1, Math.min(4, averageSeverity));
  const lower = Math.floor(clamped);
  const upper = Math.ceil(clamped);
  const fraction = clamped - lower;

  const lowerScore = SEVERITY_WEIGHT_MAP[lower] ?? 20;
  const upperScore = SEVERITY_WEIGHT_MAP[upper] ?? lowerScore;

  return Math.round(lowerScore + (upperScore - lowerScore) * fraction);
}

/**
 * Converts the time of the most recent report to a recency score.
 * Scoring:
 *   Today (< 24h)    → 100
 *   Last 3 days      → 80
 *   Last week        → 60
 *   Last month       → 30
 *   Older            → 10
 *   No reports       → 0
 */
export function calculateRecencyScore(lastReported: Date | null): number {
  if (!lastReported) return 0;
  const ageMs = Date.now() - new Date(lastReported).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays < 1)  return 100;
  if (ageDays < 3)  return 80;
  if (ageDays < 7)  return 60;
  if (ageDays < 30) return 30;
  return 10;
}

/**
 * Computes the composite hotspot score.
 * Formula: Density × 0.5 + Severity × 0.3 + Recency × 0.2
 */
export function calculateHotspotScore(
  reportCount: number,
  averageSeverity: number,
  lastReported: Date | null,
): number {
  if (reportCount <= 0) return 0;
  const density  = calculateDensityScore(reportCount);
  const severity = calculateSeverityScore(averageSeverity);
  const recency  = calculateRecencyScore(lastReported);

  const raw = density * 0.5 + severity * 0.3 + recency * 0.2;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

/**
 * Maps a 0–100 hotspot score to an enforcement priority level.
 * 0–30   → Low
 * 31–60  → Medium
 * 61–80  → High
 * 81–100 → Critical
 */
export function getPriorityLevel(score: number): PriorityLevel {
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Medium';
  if (score <= 80) return 'High';
  return 'Critical';
}

/**
 * Converts MongoDB severity strings to numeric weights for aggregation.
 */
export function severityToNumber(severity: string): number {
  switch (severity) {
    case 'Low':      return 1;
    case 'Medium':   return 2;
    case 'High':     return 3;
    case 'Critical': return 4;
    default:         return 1;
  }
}

/**
 * Determines trend by comparing current report count to historical baseline.
 */
export function calculateTrend(
  currentWeekCount: number,
  previousWeekCount: number,
): 'Increasing' | 'Stable' | 'Decreasing' {
  if (previousWeekCount === 0) return currentWeekCount > 0 ? 'Increasing' : 'Stable';
  const delta = (currentWeekCount - previousWeekCount) / previousWeekCount;
  if (delta > 0.1)  return 'Increasing';
  if (delta < -0.1) return 'Decreasing';
  return 'Stable';
}
