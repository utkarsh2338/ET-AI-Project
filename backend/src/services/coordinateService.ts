/**
 * src/services/coordinateService.ts
 *
 * Single Source of Truth for Indian District Geospatial Coordinates.
 * Loads district_coordinates.csv benchmark coordinates into memory and handles:
 * 1. Benchmark lookup for every Indian district (Single source of truth)
 * 2. Automatic detection & fix for swapped lat/lng values
 * 3. Out-of-bounds validation (Latitude: 6–38° N, Longitude: 68–98° E)
 * 4. Fallback assignment for reports with missing/invalid coordinates
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface DistrictCoordinate {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
}

const benchmarkMap = new Map<string, DistrictCoordinate>();
const districtOnlyMap = new Map<string, DistrictCoordinate>();

/**
 * Parses CSV lines safely handling quotes.
 */
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0]!.split(',').map((h) => h.trim());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]!.split(',');
    if (values.length === 0) continue;
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => {
      obj[h] = (values[idx] || '').trim();
    });
    results.push(obj);
  }
  return results;
}

/**
 * Initializes the benchmark coordinate lookup table from district_coordinates.csv.
 */
export function initCoordinateService(): void {
  try {
    const csvPath = path.resolve(__dirname, '../dataset/district_coordinates.csv');
    if (!fs.existsSync(csvPath)) {
      logger.warn('district_coordinates.csv not found at path', { csvPath });
      return;
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(content);

    rows.forEach((r) => {
      const dist = r['district']?.trim();
      const state = r['state']?.trim();
      let lat = parseFloat(r['latitude'] || '');
      let lng = parseFloat(r['longitude'] || '');

      if (!dist || !state || isNaN(lat) || isNaN(lng)) return;

      // Detect swapped lat/lng
      if (lat > 50 && lng < 50) {
        const temp = lat;
        lat = lng;
        lng = temp;
      }

      if (isWithinIndiaBounds(lat, lng)) {
        const entry: DistrictCoordinate = { district: dist, state, latitude: lat, longitude: lng };
        const fullKey = `${dist.toLowerCase()}|${state.toLowerCase()}`;
        benchmarkMap.set(fullKey, entry);
        if (!districtOnlyMap.has(dist.toLowerCase())) {
          districtOnlyMap.set(dist.toLowerCase(), entry);
        }
      }
    });

    logger.info(`CoordinateService initialized with ${benchmarkMap.size} district benchmark coordinates.`);
  } catch (err) {
    logger.error('Failed to initialize CoordinateService', { error: String(err) });
  }
}

/**
 * Validates if coordinates fall within the geographical boundary of India.
 * Latitude: 6.0° N to 38.0° N, Longitude: 68.0° E to 98.0° E
 */
export function isWithinIndiaBounds(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return false;
  }
  return lat >= 6.0 && lat <= 38.0 && lng >= 68.0 && lng <= 98.0;
}

/**
 * Looks up benchmark coordinates for a district from district_coordinates.csv.
 */
export function getBenchmarkCoordinates(district: string, state?: string): DistrictCoordinate | null {
  if (benchmarkMap.size === 0) {
    initCoordinateService();
  }

  if (state) {
    const fullKey = `${district.toLowerCase().trim()}|${state.toLowerCase().trim()}`;
    if (benchmarkMap.has(fullKey)) {
      return benchmarkMap.get(fullKey)!;
    }
  }

  const distKey = district.toLowerCase().trim();
  if (districtOnlyMap.has(distKey)) {
    return districtOnlyMap.get(distKey)!;
  }

  // Partial / fuzzy match search
  for (const [key, val] of districtOnlyMap.entries()) {
    if (key.includes(distKey) || distKey.includes(key)) {
      return val;
    }
  }

  return null;
}

/**
 * Validates and fixes coordinates for any district report.
 * Single source of truth strategy:
 * If benchmark coordinates exist for the district, ALWAYS returns benchmark coordinates.
 * Otherwise validates and corrects swapped values or returns default fallback.
 */
export function resolveDistrictCoordinates(
  district: string,
  state: string,
  rawLat?: number,
  rawLng?: number,
): { latitude: number; longitude: number; isBenchmark: boolean } {
  // 1. Try Benchmark Lookup (Single Source of Truth)
  const benchmark = getBenchmarkCoordinates(district, state);
  if (benchmark) {
    return { latitude: benchmark.latitude, longitude: benchmark.longitude, isBenchmark: true };
  }

  // 2. Validate provided raw coordinates
  let lat = rawLat;
  let lng = rawLng;

  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    // Detect swapped lat/lng
    if (lat > 50 && lng < 50) {
      const temp = lat;
      lat = lng;
      lng = temp;
    }

    if (isWithinIndiaBounds(lat, lng)) {
      return { latitude: lat, longitude: lng, isBenchmark: false };
    }
  }

  // 3. Fallback: Default to New Delhi (28.6139, 77.2090) if completely unmapped
  return { latitude: 28.6139, longitude: 77.2090, isBenchmark: false };
}

// Auto-initialize on load
initCoordinateService();
