/**
 * src/scripts/importData.ts
 *
 * Production-ready dataset importer and validator for the Cyber Fraud System.
 *
 * - Reads all 4 datasets from backend/src/dataset/
 * - Validates every record (district, state, coordinates, dates, severity, category)
 * - Skips invalid rows with logged warning reasons
 * - Prevents duplicate imports using reportId and SHA-256 content hashes
 * - Populates Report and District (DistrictStats) MongoDB collections
 * - Automatically recalculates district hotspot scores
 * - Prints import summary statistics
 *
 * Usage:
 *   npx ts-node src/scripts/importData.ts
 *   npx ts-node src/scripts/importData.ts --clear
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { config } from '../config/env';
import { Report } from '../models/Report';
import { District } from '../models/District';
import { recalculateDistrict } from '../services/hotspotService';
import { resolveDistrictCoordinates } from '../services/coordinateService';

const CLEAR = process.argv.includes('--clear');
const datasetDir = path.resolve(__dirname, '../dataset');

interface CoordEntry {
  district: string;
  state: string;
  lat: number;
  lng: number;
}

const VALID_SEVERITIES = new Set(['Low', 'Medium', 'High', 'Critical']);

function normalizeSeverity(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (s === 'low') return 'Low';
  if (s === 'medium') return 'Medium';
  if (s === 'high') return 'High';
  if (s === 'critical') return 'Critical';
  return null;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const header = parseCSVLine(lines[0]!);
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]!);
    if (values.length === 0) continue;
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => {
      obj[h.trim()] = (values[idx] || '').trim();
    });
    results.push(obj);
  }
  return results;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function generateContentHash(district: string, text: string): string {
  const key = `${district.toLowerCase()}:${text.toLowerCase().slice(0, 100)}`;
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function runImport(): Promise<{
  importedReports: number;
  importedDistricts: number;
  invalidRows: number;
  duplicateRows: number;
}> {
  console.log('\n🌐 Connecting to MongoDB Atlas...');
  await mongoose.connect(config.mongodbUri);
  console.log('✅ Connected to MongoDB\n');

  if (CLEAR) {
    console.log('🗑️  --clear flag detected. Wiping existing collections...');
    await Promise.all([Report.deleteMany({}), District.deleteMany({})]);
    console.log('✅ Collections wiped\n');
  }

  let importedReports = 0;
  let importedDistricts = 0;
  let invalidRows = 0;
  let duplicateRows = 0;

  // ─────────────────────────────────────────────────────────────
  // 1. Read and Validate district_coordinates.csv
  // ─────────────────────────────────────────────────────────────
  console.log('📍 Reading district_coordinates.csv...');
  const coordsPath = path.join(datasetDir, 'district_coordinates.csv');
  const coordsContent = fs.readFileSync(coordsPath, 'utf-8');
  const coordsRows = parseCSV(coordsContent);

  const coordLookup = new Map<string, CoordEntry>();

  for (let i = 0; i < coordsRows.length; i++) {
    const r = coordsRows[i]!;
    const d = r['district']?.trim();
    const s = r['state']?.trim();
    const lat = parseFloat(r['latitude'] || '');
    const lng = parseFloat(r['longitude'] || '');

    if (!d || !s || isNaN(lat) || isNaN(lng)) {
      invalidRows++;
      console.warn(`  ⚠️ [Row ${i + 2}] Invalid district coordinates entry: missing required fields`);
      continue;
    }

    if (lat < 6 || lat > 38 || lng < 68 || lng > 98) {
      invalidRows++;
      console.warn(`  ⚠️ [Row ${i + 2}] Out-of-bounds coordinates (${lat}, ${lng}) for ${d}, ${s}`);
      continue;
    }

    const entry: CoordEntry = { district: d, state: s, lat, lng };
    coordLookup.set(`${d.toLowerCase()}|${s.toLowerCase()}`, entry);
    // Secondary lookup by district name alone
    if (!coordLookup.has(d.toLowerCase())) {
      coordLookup.set(d.toLowerCase(), entry);
    }

    // Upsert District document
    await District.findOneAndUpdate(
      { district: d, state: s },
      {
        $set: {
          latitude: lat,
          longitude: lng,
          lastCalculated: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    importedDistricts++;
  }
  console.log(`✅ Loaded & initialized ${importedDistricts} district coordinate benchmarks.\n`);

  // ─────────────────────────────────────────────────────────────
  // 2. Read and Validate fraud_categories.csv
  // ─────────────────────────────────────────────────────────────
  console.log('🏷️  Reading fraud_categories.csv...');
  const catPath = path.join(datasetDir, 'fraud_categories.csv');
  const catContent = fs.readFileSync(catPath, 'utf-8');
  const catRows = parseCSV(catContent);
  const validCategories = new Set(catRows.map((r) => r['category_name']?.trim()).filter(Boolean));
  console.log(`✅ Loaded ${validCategories.size} valid fraud categories.\n`);

  // Helper to map text/title to a category from validCategories
  function resolveCategory(rawCategory: string, textContext: string): string {
    if (rawCategory && validCategories.has(rawCategory.trim())) {
      return rawCategory.trim();
    }
    const lower = `${rawCategory} ${textContext}`.toLowerCase();
    if (lower.includes('digital arrest') || lower.includes('police') || lower.includes('customs')) {
      return 'Digital Arrest / Impersonation of Law Enforcement';
    }
    if (lower.includes('upi') || lower.includes('card') || lower.includes('banking') || lower.includes('net-banking') || lower.includes('refund')) {
      return 'Online Financial Fraud (UPI/Card/Net-banking)';
    }
    if (lower.includes('investment') || lower.includes('trading') || lower.includes('forex') || lower.includes('crypto')) {
      return 'Investment / Trading Scam';
    }
    if (lower.includes('job') || lower.includes('work-from-home') || lower.includes('task')) {
      return 'Job Fraud / Work-From-Home Scam';
    }
    if (lower.includes('loan') || lower.includes('app')) {
      return 'Loan App Harassment';
    }
    if (lower.includes('kyc')) {
      return 'KYC Update Fraud';
    }
    if (lower.includes('sim') || lower.includes('swap')) {
      return 'SIM Swap Fraud';
    }
    if (lower.includes('parcel') || lower.includes('courier')) {
      return 'Courier / Parcel Scam';
    }
    if (lower.includes('romance') || lower.includes('matrimonial')) {
      return 'Romance / Matrimonial Scam';
    }
    if (lower.includes('lottery') || lower.includes('lucky') || lower.includes('prize')) {
      return 'Lottery / Prize Scam';
    }
    if (lower.includes('phishing') || lower.includes('sms') || lower.includes('email')) {
      return 'Phishing (Email/SMS/Voice)';
    }
    if (lower.includes('sextortion') || lower.includes('video call') || lower.includes('screenshot')) {
      return 'Sextortion';
    }
    return 'Online Financial Fraud (UPI/Card/Net-banking)';
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Read & Import i4c_fraud_reports.csv
  // ─────────────────────────────────────────────────────────────
  console.log('📑 Reading i4c_fraud_reports.csv...');
  const i4cPath = path.join(datasetDir, 'i4c_fraud_reports.csv');
  const i4cContent = fs.readFileSync(i4cPath, 'utf-8');
  const i4cRows = parseCSV(i4cContent);

  const affectedDistricts = new Set<string>();

  for (let i = 0; i < i4cRows.length; i++) {
    const r = i4cRows[i]!;
    const line = i + 2;
    const reportId = r['report_id']?.trim();
    const d = r['district']?.trim();
    const s = r['state']?.trim();
    const rawSev = r['severity']?.trim();
    const rawDate = r['date']?.trim();
    const lat = parseFloat(r['latitude'] || '');
    const lng = parseFloat(r['longitude'] || '');
    const desc = r['description']?.trim() || '';
    const fraudType = r['fraud_type']?.trim() || '';

    // Validation 1: Missing District or State
    if (!d || !s) {
      invalidRows++;
      console.warn(`  ⚠️ [I4C Row ${line}] Skipped: Missing district or state`);
      continue;
    }

    // Validation 2: Date
    const timestamp = new Date(rawDate);
    if (isNaN(timestamp.getTime())) {
      invalidRows++;
      console.warn(`  ⚠️ [I4C Row ${line}] Skipped: Invalid date format "${rawDate}"`);
      continue;
    }

    // Validation 3: Severity
    const severity = normalizeSeverity(rawSev);
    if (!severity || !VALID_SEVERITIES.has(severity)) {
      invalidRows++;
      console.warn(`  ⚠️ [I4C Row ${line}] Skipped: Invalid severity "${rawSev}"`);
      continue;
    }

    // Validation 4: Coordinates (Resolved against Single Source of Truth)
    const resolvedCoords = resolveDistrictCoordinates(d, s, lat, lng);

    // Deduplication check by reportId
    const existingById = await Report.findOne({ reportId });
    if (existingById) {
      duplicateRows++;
      continue;
    }

    // Deduplication check by SHA-256 contentHash
    const contentHash = generateContentHash(d, desc);
    const existingByHash = await Report.findOne({ contentHash });
    if (existingByHash) {
      duplicateRows++;
      continue;
    }

    const category = resolveCategory(fraudType, desc);

    const report = new Report({
      reportId: reportId || `I4C-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      title: fraudType || 'I4C Cyber Fraud Report',
      description: desc,
      category,
      district: d,
      state: s,
      latitude: resolvedCoords.latitude,
      longitude: resolvedCoords.longitude,
      timestamp,
      severity,
      status: 'Verified',
      source: 'Police',
      contentHash,
    });

    await report.save();
    importedReports++;
    affectedDistricts.add(`${d}|${s}`);
  }
  console.log(`✅ Processed ${i4cRows.length} I4C historical reports.\n`);

  // ─────────────────────────────────────────────────────────────
  // 4. Read & Import citizens_sample_reports.json
  // ─────────────────────────────────────────────────────────────
  console.log('👤 Reading citizens_sample_reports.json...');
  const jsonPath = path.join(datasetDir, 'citizens_sample_reports.json');
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const jsonRows: any[] = JSON.parse(jsonContent);

  for (let i = 0; i < jsonRows.length; i++) {
    const r = jsonRows[i];
    const line = i + 1;
    const title = r.title?.trim() || '';
    const desc = r.description?.trim() || '';
    const d = r.district?.trim();
    const s = r.state?.trim();
    const rawSev = r.severity?.trim();
    const rawDate = r.timestamp?.trim();

    // Validation 1: Missing District or State
    if (!d || !s) {
      invalidRows++;
      console.warn(`  ⚠️ [JSON Item ${line}] Skipped: Missing district or state`);
      continue;
    }

    // Validation 2: Date
    const timestamp = new Date(rawDate);
    if (isNaN(timestamp.getTime())) {
      invalidRows++;
      console.warn(`  ⚠️ [JSON Item ${line}] Skipped: Invalid date format "${rawDate}"`);
      continue;
    }

    // Validation 3: Severity
    const severity = normalizeSeverity(rawSev);
    if (!severity || !VALID_SEVERITIES.has(severity)) {
      invalidRows++;
      console.warn(`  ⚠️ [JSON Item ${line}] Skipped: Invalid severity "${rawSev}"`);
      continue;
    }

    // Validation 4: Coordinates (Lookup from district_coordinates.csv benchmark)
    const jsonCoords = resolveDistrictCoordinates(d, s, r.latitude, r.longitude);

    // Deduplication check by contentHash
    const contentHash = generateContentHash(d, `${title} ${desc}`);
    const existingByHash = await Report.findOne({ contentHash });
    if (existingByHash) {
      duplicateRows++;
      continue;
    }

    const category = resolveCategory('', `${title} ${desc}`);
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();

    const report = new Report({
      reportId: `CFS-${rand}-CITIZEN`,
      title,
      description: desc,
      category,
      district: d,
      state: s,
      latitude: jsonCoords.latitude,
      longitude: jsonCoords.longitude,
      timestamp,
      severity,
      status: 'Pending',
      source: 'Citizen',
      contentHash,
    });

    await report.save();
    importedReports++;
    affectedDistricts.add(`${d}|${s}`);
  }
  console.log(`✅ Processed ${jsonRows.length} sample citizen reports.\n`);

  // ─────────────────────────────────────────────────────────────
  // 5. Recalculate District Hotspot Scores
  // ─────────────────────────────────────────────────────────────
  console.log('⚡ Recalculating district hotspot scores & aggregation metrics...');
  for (const item of affectedDistricts) {
    const [distName, stateName] = item.split('|');
    if (distName && stateName) {
      await recalculateDistrict(distName, stateName);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. Print Summary Statistics
  // ─────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📊 IMPORT SUMMARY STATISTICS');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`✔ Imported Reports  : ${importedReports.toLocaleString()}`);
  console.log(`✔ Imported Districts: ${importedDistricts.toLocaleString()}`);
  console.log(`✔ Invalid Rows      : ${invalidRows}`);
  console.log(`✔ Duplicate Rows    : ${duplicateRows}`);
  console.log('════════════════════════════════════════════════════════════\n');
  console.log('Import completed successfully.\n');

  return { importedReports, importedDistricts, invalidRows, duplicateRows };
}

if (require.main === module) {
  runImport()
    .then(async () => {
      await mongoose.connection.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('\n❌ Import script failed:', err);
      await mongoose.connection.close();
      process.exit(1);
    });
}
