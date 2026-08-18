/**
 * frontend/src/lib/geoValidator.ts
 *
 * High-performance Point-In-Polygon Geographic Validation for Indian Territory.
 * Uses exact MultiPolygon Survey of India / DataMeet GIS composite datasets.
 * Features:
 * - Ray-casting Point-In-Polygon algorithm with support for outer rings and holes
 * - O(1) Per-polygon bounding box fast pre-filtering
 * - LRU / In-memory coordinate cache to eliminate redundant calculations on re-renders
 * - Automatic swapped coordinate detection & correction
 */

import { INDIA_BOUNDARY_POLYGONS, PolygonBoundary } from '../data/indiaGeoJson';

// In-memory cache for validated coordinate pairs
const geoValidationCache = new Map<string, boolean>();
const MAX_CACHE_SIZE = 5000;

/**
 * Standard Ray-Casting algorithm for point-in-polygon ring test.
 * Coordinates are [longitude, latitude].
 */
function isPointInRing(lng: number, lat: number, ring: [number, number][]): boolean {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks if a point (lng, lat) falls inside a Polygon with precomputed bounding box.
 */
function isPointInPolygon(lng: number, lat: number, poly: PolygonBoundary): boolean {
  const [minLng, minLat, maxLng, maxLat] = poly.bbox;

  // Fast O(1) rejection if outside polygon bounding box
  if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) {
    return false;
  }

  // Check outer ring (rings[0])
  if (!isPointInRing(lng, lat, poly.rings[0])) {
    return false;
  }

  // Check inner holes (rings[1..]) - point must NOT be inside any hole
  for (let h = 1; h < poly.rings.length; h++) {
    if (isPointInRing(lng, lat, poly.rings[h])) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if the given latitude/longitude is within India's actual land boundary.
 */
export function isPointInIndia(lat: number, lng: number): boolean {
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    isNaN(lat) ||
    isNaN(lng) ||
    !isFinite(lat) ||
    !isFinite(lng)
  ) {
    return false;
  }

  // Global India loose bounding box fast rejection
  // (Mainland + Andaman & Nicobar / Lakshadweep)
  if (lat < 6.0 || lat > 37.5 || lng < 68.0 || lng > 97.5) {
    return false;
  }

  // Coordinate cache lookup (rounded to 4 decimal places ~11m precision)
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geoValidationCache.has(cacheKey)) {
    return geoValidationCache.get(cacheKey)!;
  }

  let inside = false;
  for (let i = 0; i < INDIA_BOUNDARY_POLYGONS.length; i++) {
    if (isPointInPolygon(lng, lat, INDIA_BOUNDARY_POLYGONS[i])) {
      inside = true;
      break;
    }
  }

  if (geoValidationCache.size > MAX_CACHE_SIZE) {
    geoValidationCache.clear();
  }
  geoValidationCache.set(cacheKey, inside);

  return inside;
}

export interface ValidatedCoordinate {
  lat: number;
  lng: number;
  isValid: boolean;
}

/**
 * Validates, autocorrects swapped coordinates, and verifies against India GeoJSON.
 */
export function validateMarkerCoordinates(rawLat: unknown, rawLng: unknown): ValidatedCoordinate {
  if (rawLat === null || rawLat === undefined || rawLng === null || rawLng === undefined) {
    return { lat: 0, lng: 0, isValid: false };
  }

  let lat = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat));
  let lng = typeof rawLng === 'number' ? rawLng : parseFloat(String(rawLng));

  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    return { lat: 0, lng: 0, isValid: false };
  }

  // Detect and autocorrect swapped lat/lng (e.g. lat=77.59, lng=12.97)
  if (lat > 50 && lng < 50) {
    const temp = lat;
    lat = lng;
    lng = temp;
  }

  // Point-in-polygon verification against true India GeoJSON
  const isValid = isPointInIndia(lat, lng);

  return { lat, lng, isValid };
}
