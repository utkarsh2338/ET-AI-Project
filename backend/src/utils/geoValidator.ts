/**
 * backend/src/utils/geoValidator.ts
 *
 * High-performance Point-In-Polygon Geographic Validation for Indian Territory.
 * Sourced from Survey of India / DataMeet GIS composite datasets.
 */

import { INDIA_BOUNDARY_POLYGONS, PolygonBoundary } from '../data/indiaGeoJson';

const geoValidationCache = new Map<string, boolean>();
const MAX_CACHE_SIZE = 5000;

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

function isPointInPolygon(lng: number, lat: number, poly: PolygonBoundary): boolean {
  const [minLng, minLat, maxLng, maxLat] = poly.bbox;

  // Fast O(1) rejection if outside polygon bounding box
  if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) {
    return false;
  }

  // Check outer ring
  if (!isPointInRing(lng, lat, poly.rings[0])) {
    return false;
  }

  // Check inner holes
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
  if (lat < 6.0 || lat > 37.5 || lng < 68.0 || lng > 97.5) {
    return false;
  }

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

export function validateCoordinates(rawLat: unknown, rawLng: unknown): ValidatedCoordinate {
  if (rawLat === null || rawLat === undefined || rawLng === null || rawLng === undefined) {
    return { lat: 0, lng: 0, isValid: false };
  }

  let lat = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat));
  let lng = typeof rawLng === 'number' ? rawLng : parseFloat(String(rawLng));

  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    return { lat: 0, lng: 0, isValid: false };
  }

  if (lat > 50 && lng < 50) {
    const temp = lat;
    lat = lng;
    lng = temp;
  }

  const isValid = isPointInIndia(lat, lng);
  return { lat, lng, isValid };
}
