/**
 * backend/src/tests/geoValidator.test.ts
 *
 * Unit tests for Point-In-Polygon Geographic Validation of Indian Territory.
 * Tests accuracy across all benchmark districts, international waters, and neighboring countries.
 */

import fs from 'fs';
import path from 'path';
import { isPointInIndia, validateCoordinates } from '../utils/geoValidator';
import { isWithinIndiaBounds, getBenchmarkCoordinates, resolveDistrictCoordinates } from '../services/coordinateService';

describe('Point-In-Polygon Geographic Validation (geoValidator)', () => {
  describe('All 44 Benchmark Indian Districts', () => {
    const csvPath = path.resolve(__dirname, '../dataset/district_coordinates.csv');
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0).slice(1);

    lines.forEach((line) => {
      const [district, state, latStr, lngStr] = line.split(',').map((s) => s.trim());
      const lat = parseFloat(latStr || '0');
      const lng = parseFloat(lngStr || '0');

      it(`should recognize ${district}, ${state} (${lat}, ${lng}) as inside India`, () => {
        expect(isPointInIndia(lat, lng)).toBe(true);
        expect(isWithinIndiaBounds(lat, lng)).toBe(true);
      });
    });
  });

  describe('Coastal & Boundary Benchmark Districts', () => {
    const coastalDistricts = [
      { name: 'Ernakulam (Kochi)', lat: 9.9312, lng: 76.2673 },
      { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Dakshina Kannada (Mangaluru)', lat: 12.9141, lng: 74.8560 },
      { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
      { name: 'Surat', lat: 21.1702, lng: 72.8311 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
      { name: 'Guwahati (Northeast)', lat: 26.1445, lng: 91.7362 },
      { name: 'Dehradun (North)', lat: 30.3165, lng: 78.0322 },
    ];

    coastalDistricts.forEach((d) => {
      it(`should recognize coastal district ${d.name} (${d.lat}, ${d.lng}) as inside India`, () => {
        expect(isPointInIndia(d.lat, d.lng)).toBe(true);
      });
    });
  });

  describe('Strict Rejection of Ocean & International Coordinates', () => {
    const outsidePoints = [
      { name: 'Indian Ocean Deep South (lat 2.0)', lat: 2.0, lng: 77.5 },
      { name: 'Indian Ocean Deep South (lat 4.0)', lat: 4.0, lng: 77.5 },
      { name: 'Indian Ocean South of Kanyakumari (lat 6.5)', lat: 6.5, lng: 77.5 },
      { name: 'Indian Ocean near Kanyakumari (lat 7.5)', lat: 7.5, lng: 77.5 },
      { name: 'South of Sri Lanka (lat 4.5, lng 80.5)', lat: 4.5, lng: 80.5 },
      { name: 'South of Sri Lanka (lat 5.5, lng 80.5)', lat: 5.5, lng: 80.5 },
      { name: 'Colombo, Sri Lanka', lat: 6.9271, lng: 79.8612 },
      { name: 'Kandy, Sri Lanka', lat: 7.2906, lng: 80.6337 },
      { name: 'Galle, Sri Lanka', lat: 6.0535, lng: 80.2210 },
      { name: 'Male, Maldives', lat: 4.1755, lng: 73.5093 },
      { name: 'Arabian Sea deep waters (lat 15.0, lng 70.0)', lat: 15.0, lng: 70.0 },
      { name: 'Arabian Sea off Goa (lat 14.5, lng 72.0)', lat: 14.5, lng: 72.0 },
      { name: 'Bay of Bengal central (lat 15.0, lng 88.0)', lat: 15.0, lng: 88.0 },
      { name: 'Bay of Bengal off Andhra (lat 14.0, lng 83.0)', lat: 14.0, lng: 83.0 },
      { name: 'Lahore, Pakistan', lat: 31.5204, lng: 74.3587 },
      { name: 'Karachi, Pakistan', lat: 24.8607, lng: 67.0011 },
      { name: 'Islamabad, Pakistan', lat: 33.6844, lng: 73.0479 },
      { name: 'Dhaka, Bangladesh', lat: 23.8103, lng: 90.4125 },
      { name: 'Chittagong, Bangladesh', lat: 22.3569, lng: 91.7832 },
      { name: 'Kathmandu, Nepal', lat: 27.7172, lng: 85.3240 },
      { name: 'Pokhara, Nepal', lat: 28.2096, lng: 83.9856 },
      { name: 'Thimphu, Bhutan', lat: 27.4728, lng: 89.6393 },
      { name: 'Yangon, Myanmar', lat: 16.8661, lng: 96.1951 },
      { name: 'Mandalay, Myanmar', lat: 21.9588, lng: 96.0891 },
    ];

    outsidePoints.forEach((p) => {
      it(`should strictly reject ${p.name} (${p.lat}, ${p.lng})`, () => {
        expect(isPointInIndia(p.lat, p.lng)).toBe(false);
        expect(isWithinIndiaBounds(p.lat, p.lng)).toBe(false);
      });
    });
  });

  describe('Swapped Coordinate Autocorrection & Edge Cases', () => {
    it('should autocorrect swapped latitude/longitude (e.g. Bengaluru: lat=77.5946, lng=12.9716)', () => {
      const result = validateCoordinates(77.5946, 12.9716);
      expect(result.isValid).toBe(true);
      expect(result.lat).toBeCloseTo(12.9716, 4);
      expect(result.lng).toBeCloseTo(77.5946, 4);
    });

    it('should autocorrect swapped latitude/longitude for New Delhi', () => {
      const result = validateCoordinates(77.2090, 28.6139);
      expect(result.isValid).toBe(true);
      expect(result.lat).toBeCloseTo(28.6139, 4);
      expect(result.lng).toBeCloseTo(77.2090, 4);
    });

    it('should reject NaN coordinates', () => {
      expect(validateCoordinates(NaN, 77.59).isValid).toBe(false);
      expect(validateCoordinates(12.97, NaN).isValid).toBe(false);
    });

    it('should reject null and undefined coordinates', () => {
      expect(validateCoordinates(null, 77.59).isValid).toBe(false);
      expect(validateCoordinates(12.97, undefined).isValid).toBe(false);
    });

    it('should reject non-numeric strings that cannot be parsed', () => {
      expect(validateCoordinates('abc', 'def').isValid).toBe(false);
    });

    it('should parse valid string coordinates', () => {
      const result = validateCoordinates('12.9716', '77.5946');
      expect(result.isValid).toBe(true);
      expect(result.lat).toBeCloseTo(12.9716, 4);
      expect(result.lng).toBeCloseTo(77.5946, 4);
    });

    it('should reject extreme coordinates outside earth bounds', () => {
      expect(validateCoordinates(95.0, 150.0).isValid).toBe(false);
      expect(validateCoordinates(-45.0, 0.0).isValid).toBe(false);
    });
  });

  describe('coordinateService benchmark lookup & fallback', () => {
    it('should return benchmark coordinates for known district', () => {
      const coords = getBenchmarkCoordinates('Mumbai', 'Maharashtra');
      expect(coords).not.toBeNull();
      expect(coords?.latitude).toBeCloseTo(19.0760, 4);
      expect(coords?.longitude).toBeCloseTo(72.8777, 4);
    });

    it('should fallback to New Delhi for completely invalid / ocean coordinates of unknown district', () => {
      const result = resolveDistrictCoordinates('Unknown Ocean District', 'Unknown', 4.0, 77.5);
      expect(result.isBenchmark).toBe(false);
      expect(result.latitude).toBeCloseTo(28.6139, 4);
      expect(result.longitude).toBeCloseTo(77.2090, 4);
    });
  });
});
