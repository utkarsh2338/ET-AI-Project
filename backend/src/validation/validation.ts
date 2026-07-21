import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { predict, extractOnly } from '../services/predictionService';
import { DatasetRow, ValidationMetrics, ValidationResult } from '../types';

const args = process.argv.slice(2);
const datasetArgIdx = args.indexOf('--dataset');
const noGemini = args.includes('--no-gemini');

const defaultDatasetPath = path.resolve(__dirname, '../dataset/sample_dataset.csv');
const datasetPath = datasetArgIdx !== -1 && args[datasetArgIdx + 1]
  ? path.resolve(args[datasetArgIdx + 1] as string)
  : defaultDatasetPath;

function loadDataset(filePath: string): DatasetRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<{ message: string; label: string }>;

  return records.map((row, i) => {
    const label = parseInt(row.label, 10);
    if (label !== 0 && label !== 1) {
      throw new Error(`Invalid label "${row.label}" at row ${i + 2}. Expected 0 or 1.`);
    }
    if (!row.message || row.message.trim().length === 0) {
      throw new Error(`Empty message at row ${i + 2}.`);
    }
    return { message: row.message.trim(), label: label as 0 | 1 };
  });
}

function heuristicClassify(message: string): { predictedLabel: 0 | 1; confidence: number } {
  const f = extractOnly(message);

  let score = 0;

  // Core scam signals — high weight
  score += f.otp_request ? 30 : 0;            // OTP-sharing requests are almost always scam
  score += f.payment_request ? 22 : 0;         // Payment demands are very high signal
  score += f.contains_ip_url ? 20 : 0;         // IP-based URLs = near-certain scam
  score += f.threat_score * 7;                  // Threats scale up to 70 points

  // Moderate signals
  score += f.urgency_score * 4;                 // Urgency scales up to 40 points
  score += f.authority_impersonation ? 15 : 0;  // Brand/authority impersonation
  score += f.reward_or_lottery ? 15 : 0;        // Lottery/prize scams
  score += f.contains_shortened_url ? 12 : 0;  // Shortened URLs are suspicious

  // Supporting signals — lower weight, but accumulate
  score += f.bank_keywords ? 5 : 0;            // Banking terminology in context
  score += f.crypto_keywords ? 8 : 0;          // Crypto payment requests
  score += f.phone_number_count > 0 ? 4 : 0;  // Unsolicited phone numbers
  score += f.currency_symbol_count > 0 ? 3 : 0; // Currency amounts in message
  score += f.uppercase_ratio > 0.25 ? 5 : 0;  // Excessive caps (URGENT, BLOCKED)
  score += f.exclamation_count > 2 ? 4 : 0;   // Multiple exclamation marks
  score += f.digit_ratio > 0.08 ? 3 : 0;      // High digit ratio (amounts, codes)

  const confidence = Math.min(100, score);

  // Threshold of 22: low enough that a single strong signal (OTP request,
  // payment demand) triggers a Scam label, while neutral messages stay below.
  const predictedLabel: 0 | 1 = confidence >= 22 ? 1 : 0;
  return { predictedLabel, confidence };
}



function computeMetrics(results: ValidationResult[]): ValidationMetrics {
  let tp = 0, tn = 0, fp = 0, fn = 0;

  for (const r of results) {
    if (r.expectedLabel === 1 && r.predictedLabel === 1) tp++;
    else if (r.expectedLabel === 0 && r.predictedLabel === 0) tn++;
    else if (r.expectedLabel === 0 && r.predictedLabel === 1) fp++;
    else fn++;
  }

  const accuracy = results.length > 0 ? (tp + tn) / results.length : 0;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
  const f1Score = (precision + recall) > 0
    ? 2 * (precision * recall) / (precision + recall)
    : 0;
  const fpr = (fp + tn) > 0 ? fp / (fp + tn) : 0;  // False Positive Rate
  const fnr = (fn + tp) > 0 ? fn / (fn + tp) : 0;  // False Negative Rate

  return {
    totalSamples: results.length,
    accuracy: parseFloat((accuracy * 100).toFixed(2)),
    precision: parseFloat((precision * 100).toFixed(2)),
    recall: parseFloat((recall * 100).toFixed(2)),
    f1Score: parseFloat((f1Score * 100).toFixed(2)),
    falsePositiveRate: parseFloat((fpr * 100).toFixed(2)),
    falseNegativeRate: parseFloat((fnr * 100).toFixed(2)),
    confusionMatrix: { truePositives: tp, trueNegatives: tn, falsePositives: fp, falseNegatives: fn },
  };
}


function printHeader(title: string): void {
  const line = '═'.repeat(60);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(line);
}

function printMetrics(metrics: ValidationMetrics): void {
  const cm = metrics.confusionMatrix;

  printHeader('📊 Validation Results');
  console.log(`  Total Samples       : ${metrics.totalSamples}`);
  console.log(`  Accuracy            : ${metrics.accuracy}%`);
  console.log(`  Precision           : ${metrics.precision}%`);
  console.log(`  Recall (Sensitivity): ${metrics.recall}%`);
  console.log(`  F1 Score            : ${metrics.f1Score}%`);
  console.log(`  False Positive Rate : ${metrics.falsePositiveRate}%`);
  console.log(`  False Negative Rate : ${metrics.falseNegativeRate}%`);

  printHeader('🔢 Confusion Matrix');
  console.log(`                    Predicted`);
  console.log(`                   Scam   Legit`);
  console.log(`  Actual  Scam  │  ${String(cm.truePositives).padEnd(4)} │  ${cm.falseNegatives}`);
  console.log(`          Legit │  ${String(cm.falsePositives).padEnd(4)} │  ${cm.trueNegatives}`);
  console.log('');
}

function printResults(results: ValidationResult[]): void {
  printHeader('📋 Per-Message Results');
  for (const r of results) {
    const label = r.correct ? '✅' : '❌';
    const verdict = r.predictedLabel === 1 ? 'SCAM ' : 'LEGIT';
    const expected = r.expectedLabel === 1 ? 'SCAM ' : 'LEGIT';
    const excerpt = r.message.slice(0, 55).replace(/\n/g, ' ');
    console.log(
      `  ${label} [Pred: ${verdict}] [Actual: ${expected}] [Conf: ${String(r.confidence).padStart(3)}%] "${excerpt}..."`
    );
  }
}

async function main(): Promise<void> {
  console.log('\n🔍 Scam Detection — Dataset Validation');
  console.log(`   Dataset: ${datasetPath}`);
  console.log(`   Mode: ${noGemini ? 'Heuristic (no Gemini)' : 'Full pipeline (Gemini)'}`);

  const dataset = loadDataset(datasetPath);
  console.log(`   Loaded ${dataset.length} samples\n`);

  const results: ValidationResult[] = [];
  let processed = 0;

  for (const row of dataset) {
    try {
      let predictedLabel: 0 | 1;
      let confidence: number;

      if (noGemini) {
        const result = heuristicClassify(row.message);
        predictedLabel = result.predictedLabel;
        confidence = result.confidence;
      } else {
        const result = await predict(row.message);
        predictedLabel = result.prediction === 'Scam' ? 1 : 0;
        confidence = result.confidence;
      }

      results.push({
        message: row.message,
        expectedLabel: row.label,
        predictedLabel,
        confidence,
        correct: predictedLabel === row.label,
      });

      processed++;
      process.stdout.write(`\r   Progress: ${processed}/${dataset.length}`);

      // Small delay to avoid hitting rate limits when using Gemini
      if (!noGemini && processed < dataset.length) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`\n   ⚠️  Failed on row ${processed + 1}: ${msg}`);
      // Count as incorrect prediction
      results.push({
        message: row.message,
        expectedLabel: row.label,
        predictedLabel: row.label === 1 ? 0 : 1,
        confidence: 0,
        correct: false,
      });
      processed++;
    }
  }

  console.log(''); // newline after progress

  printResults(results);

  const metrics = computeMetrics(results);
  printMetrics(metrics);

  // Suggestions for low F1
  if (metrics.f1Score < 80) {
    console.log('  ⚠️  F1 score below 80%. Consider:');
    console.log('     - Adding domain-specific keywords to constants/keywords.ts');
    console.log('     - Tuning the heuristic threshold in heuristicClassify()');
    console.log('     - Increasing the training dataset size');
    console.log('');
  }
}

main().catch((err: Error) => {
  console.error('\n❌ Validation failed:', err.message);
  process.exit(1);
});
