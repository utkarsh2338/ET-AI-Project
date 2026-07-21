/**
 * src/tests/hotspot.test.ts
 *
 * Unit tests for scoringService (pure functions).
 * No database or network calls.
 */

import {
  calculateDensityScore,
  calculateSeverityScore,
  calculateRecencyScore,
  calculateHotspotScore,
  getPriorityLevel,
  calculateTrend,
} from '../services/scoringService';

describe('scoringService — calculateDensityScore()', () => {
  it('should return 0 for 0 reports', () => {
    expect(calculateDensityScore(0)).toBe(0);
  });

  it('should return a positive score for 1 report', () => {
    expect(calculateDensityScore(1)).toBeGreaterThan(0);
  });

  it('should cap at 100 for extremely large counts', () => {
    expect(calculateDensityScore(100000)).toBeLessThanOrEqual(100);
  });

  it('should return ~100 for baseline count', () => {
    expect(calculateDensityScore(500)).toBe(100);
  });

  it('should be monotonically increasing', () => {
    const s10  = calculateDensityScore(10);
    const s100 = calculateDensityScore(100);
    const s500 = calculateDensityScore(500);
    expect(s100).toBeGreaterThan(s10);
    expect(s500).toBeGreaterThan(s100);
  });
});

describe('scoringService — calculateSeverityScore()', () => {
  it('should return 20 for severity 1 (Low)', () => {
    expect(calculateSeverityScore(1)).toBe(20);
  });

  it('should return 45 for severity 2 (Medium)', () => {
    expect(calculateSeverityScore(2)).toBe(45);
  });

  it('should return 75 for severity 3 (High)', () => {
    expect(calculateSeverityScore(3)).toBe(75);
  });

  it('should return 100 for severity 4 (Critical)', () => {
    expect(calculateSeverityScore(4)).toBe(100);
  });

  it('should interpolate for fractional severity', () => {
    const score = calculateSeverityScore(2.5);
    expect(score).toBeGreaterThan(45);
    expect(score).toBeLessThan(75);
  });

  it('should clamp out-of-range values', () => {
    expect(calculateSeverityScore(0)).toBe(20);
    expect(calculateSeverityScore(5)).toBe(100);
  });
});

describe('scoringService — calculateRecencyScore()', () => {
  it('should return 0 for null (no reports)', () => {
    expect(calculateRecencyScore(null)).toBe(0);
  });

  it('should return 100 for today', () => {
    expect(calculateRecencyScore(new Date())).toBe(100);
  });

  it('should return 80 for 2 days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(calculateRecencyScore(twoDaysAgo)).toBe(80);
  });

  it('should return 60 for 5 days ago', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    expect(calculateRecencyScore(fiveDaysAgo)).toBe(60);
  });

  it('should return 30 for 15 days ago', () => {
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    expect(calculateRecencyScore(fifteenDaysAgo)).toBe(30);
  });

  it('should return 10 for 60 days ago', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(calculateRecencyScore(sixtyDaysAgo)).toBe(10);
  });
});

describe('scoringService — calculateHotspotScore()', () => {
  it('should return 0 for empty district', () => {
    expect(calculateHotspotScore(0, 1, null)).toBe(0);
  });

  it('should produce high score for high-activity district', () => {
    const score = calculateHotspotScore(500, 4, new Date());
    expect(score).toBeGreaterThan(80);
  });

  it('should produce moderate score for medium-activity district', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const score = calculateHotspotScore(50, 2, threeDaysAgo);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(80);
  });

  it('should not exceed 100', () => {
    const score = calculateHotspotScore(100000, 4, new Date());
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should not go below 0', () => {
    const score = calculateHotspotScore(0, 1, null);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe('scoringService — getPriorityLevel()', () => {
  it('should return Low for score 0', ()   => expect(getPriorityLevel(0)).toBe('Low'));
  it('should return Low for score 30', ()  => expect(getPriorityLevel(30)).toBe('Low'));
  it('should return Medium for score 31', () => expect(getPriorityLevel(31)).toBe('Medium'));
  it('should return Medium for score 60', () => expect(getPriorityLevel(60)).toBe('Medium'));
  it('should return High for score 61', () => expect(getPriorityLevel(61)).toBe('High'));
  it('should return High for score 80', () => expect(getPriorityLevel(80)).toBe('High'));
  it('should return Critical for score 81', () => expect(getPriorityLevel(81)).toBe('Critical'));
  it('should return Critical for score 100', () => expect(getPriorityLevel(100)).toBe('Critical'));
});

describe('scoringService — calculateTrend()', () => {
  it('should return Increasing when current > previous by >10%', () => {
    expect(calculateTrend(12, 10)).toBe('Increasing');
  });

  it('should return Decreasing when current < previous by >10%', () => {
    expect(calculateTrend(8, 10)).toBe('Decreasing');
  });

  it('should return Stable for small changes', () => {
    expect(calculateTrend(10, 10)).toBe('Stable');
    expect(calculateTrend(10, 10.5)).toBe('Stable');
  });

  it('should return Increasing when previous is 0 and current > 0', () => {
    expect(calculateTrend(5, 0)).toBe('Increasing');
  });

  it('should return Stable when both are 0', () => {
    expect(calculateTrend(0, 0)).toBe('Stable');
  });
});
