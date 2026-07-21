import { extractFeatures } from './featureExtractor';
import { analyzeWithGemini } from './geminiService';
import {
  ExtractedFeatures,
  PredictionResult,
  RiskLevel,
} from '../types';
import { logger } from '../utils/logger';

export function mapConfidenceToRisk(confidence: number): RiskLevel {
  if (confidence <= 30) return 'Low';
  if (confidence <= 60) return 'Medium';
  if (confidence <= 80) return 'High';
  return 'Critical';
}

export async function predict(message: string): Promise<PredictionResult> {
  const pipelineStart = Date.now();

  // ── Stage 1: Deterministic Feature Extraction ──
  const featureStart = Date.now();
  const features: ExtractedFeatures = extractFeatures(message);
  logger.featureExtractionTime(Date.now() - featureStart);

  // ── Stage 2: Gemini API Reasoning ──
  const geminiResult = await analyzeWithGemini(message, features);

  // We use our own risk mapping instead of Gemini's to ensure
  // consistency with the documented 0–100 confidence scale.
  const risk: RiskLevel = mapConfidenceToRisk(geminiResult.confidence);

  logger.predictionTime(Date.now() - pipelineStart, message.length);

  return {
    prediction: geminiResult.verdict,
    confidence: geminiResult.confidence,
    risk,
    explanation: geminiResult.explanation,
    features,
    triggeredSignals: geminiResult.triggered_signals,
  };
}

export function extractOnly(message: string): ExtractedFeatures {
  return extractFeatures(message);
}
