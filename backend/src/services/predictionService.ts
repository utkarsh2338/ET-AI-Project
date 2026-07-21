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

  // Calculate total deterministic indicator count
  const hasSignals =
    features.urgency_score > 0 ||
    features.authority_impersonation ||
    features.payment_request ||
    features.otp_request ||
    features.url_count > 0 ||
    features.threat_score > 0 ||
    features.reward_or_lottery ||
    features.bank_keywords ||
    features.crypto_keywords;

  // ── Stage 2: Gemini API Reasoning ──
  const geminiResult = await analyzeWithGemini(message, features);

  let finalVerdict = geminiResult.verdict;
  let finalConfidence = geminiResult.confidence;
  let finalExplanation = geminiResult.explanation;
  let finalSignals = geminiResult.triggered_signals;

  // Enforce Deterministic Safety Rule: Meaningless/low signal text cannot be "Scam"
  if (!hasSignals) {
    if (geminiResult.verdict === 'Scam' || geminiResult.confidence < 60) {
      finalVerdict = 'Unable to Determine';
      finalConfidence = 20;
      finalExplanation = 'The supplied text does not contain sufficient fraud indicators to confidently classify it.';
      finalSignals = [];
    } else {
      finalVerdict = 'Legitimate';
      finalConfidence = 15;
      finalExplanation = 'The message appears to be standard non-fraudulent communication.';
      finalSignals = [];
    }
  } else if (geminiResult.confidence < 60) {
    finalVerdict = 'Unable to Determine';
    finalExplanation = 'The supplied text does not contain sufficient fraud indicators to confidently classify it.';
  }

  const risk: RiskLevel = mapConfidenceToRisk(finalConfidence);

  logger.predictionTime(Date.now() - pipelineStart, message.length);

  return {
    prediction: finalVerdict,
    confidence: finalConfidence,
    risk,
    explanation: finalExplanation,
    features,
    triggeredSignals: finalSignals,
  };
}

export function extractOnly(message: string): ExtractedFeatures {
  return extractFeatures(message);
}
