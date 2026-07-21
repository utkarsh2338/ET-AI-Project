import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { config } from '../config/env';
import { ExtractedFeatures, GeminiAnalysisResult, RiskLevel, Verdict } from '../types';
import { logger } from '../utils/logger';
import {
  GeminiUnavailableError,
  GeminiTimeoutError,
  InvalidGeminiResponseError,
} from '../utils/errorHandler';


let _model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!_model) {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    _model = genAI.getGenerativeModel({
      model: config.model,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,      // Low temperature → deterministic, consistent outputs
        topP: 0.8,
        maxOutputTokens: 1024,
      },
    });
  }
  return _model;
}

function buildPrompt(message: string, features: ExtractedFeatures): string {
  return `You are an expert cyber fraud analyst for a citizen-facing scam detection system.

A deterministic feature extractor has already analyzed the following message and extracted structured evidence. Your job is to:
1. Reason over the provided features to determine if the message is a scam
2. Explain which indicators contributed most to your verdict
3. Assign a confidence score (0-100) based on the weight of evidence
4. Do NOT invent new features not present in the extracted data

---

ORIGINAL MESSAGE:
"${message.replace(/"/g, '\\"')}"

---

EXTRACTED FEATURES (deterministic analysis):
${JSON.stringify(features, null, 2)}

---

SCORING GUIDANCE:
- urgency_score ≥ 3 → strong scam signal
- authority_impersonation = true → high suspicion  
- payment_request = true → very high scam indicator
- otp_request = true → critical scam signal (credential theft)
- contains_shortened_url = true → suspicious
- contains_ip_url = true → very suspicious
- threat_score ≥ 2 → strong coercive scam indicator
- reward_or_lottery = true → classic scam pattern
- Multiple signals together → dramatically increase confidence

---

RESPONSE FORMAT (JSON only, no markdown, no explanation outside JSON):
{
  "verdict": "Scam" | "Legitimate",
  "confidence": <integer 0-100>,
  "explanation": "<2-4 sentence explanation citing specific features>",
  "triggered_signals": ["<signal 1>", "<signal 2>", ...],
  "risk_level": "Low" | "Medium" | "High" | "Critical"
}

Risk level mapping:
- confidence 0-30  → "Low"
- confidence 31-60 → "Medium"
- confidence 61-80 → "High"
- confidence 81-100 → "Critical"

Respond with valid JSON only.`;
}


const VALID_VERDICTS: readonly Verdict[] = [
  'Scam',
  'Likely Scam',
  'Needs Manual Review',
  'Unable to Determine',
  'Safe',
  'Legitimate',
];
const VALID_RISK_LEVELS: readonly RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

function validateGeminiResponse(raw: unknown): GeminiAnalysisResult {
  if (typeof raw !== 'object' || raw === null) {
    throw new InvalidGeminiResponseError();
  }

  const obj = raw as Record<string, unknown>;

  const verdict = obj['verdict'];
  const confidence = obj['confidence'];
  const explanation = obj['explanation'];
  const triggered_signals = obj['triggered_signals'];
  const risk_level = obj['risk_level'];

  if (!VALID_VERDICTS.includes(verdict as Verdict)) {
    throw new InvalidGeminiResponseError();
  }

  if (typeof confidence !== 'number' || confidence < 0 || confidence > 100) {
    throw new InvalidGeminiResponseError();
  }

  if (typeof explanation !== 'string' || explanation.length === 0) {
    throw new InvalidGeminiResponseError();
  }

  if (!Array.isArray(triggered_signals)) {
    throw new InvalidGeminiResponseError();
  }

  if (!VALID_RISK_LEVELS.includes(risk_level as RiskLevel)) {
    throw new InvalidGeminiResponseError();
  }

  return {
    verdict: verdict as Verdict,
    confidence: Math.round(confidence as number),
    explanation: explanation as string,
    triggered_signals: (triggered_signals as unknown[]).map(String),
    risk_level: risk_level as RiskLevel,
  };
}

export async function analyzeWithGemini(
  message: string,
  features: ExtractedFeatures,
): Promise<GeminiAnalysisResult> {
  const prompt = buildPrompt(message, features);
  const startTime = Date.now();

  // Wrap the API call in a Promise.race to enforce our own timeout
  const apiCall = async (): Promise<GeminiAnalysisResult> => {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    logger.geminiLatency(Date.now() - startTime, config.model);

    // The responseMimeType is set to application/json, so the output
    // should be valid JSON directly — but we still parse defensively
    let parsed: unknown;
    try {
      // Remove potential markdown code fences if the model ignores the mime type
      const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      logger.error('Failed to parse Gemini JSON response', { raw: text.slice(0, 500) });
      throw new InvalidGeminiResponseError();
    }

    return validateGeminiResponse(parsed);
  };

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new GeminiTimeoutError()), config.geminiTimeoutMs);
  });

  try {
    return await Promise.race([apiCall(), timeoutPromise]);
  } catch (err) {
    // Re-throw our own typed errors as-is
    if (
      err instanceof GeminiTimeoutError ||
      err instanceof InvalidGeminiResponseError
    ) {
      throw err;
    }

    // Wrap Gemini SDK / network errors
    const message_ = err instanceof Error ? err.message : String(err);
    logger.error('Gemini API call failed', { error: message_ });
    throw new GeminiUnavailableError(message_);
  }
}

export interface TranslationResult {
  verdict: string;
  explanation: string;
  triggered_signals: string[];
  recommended_actions: string[];
  language: string;
}

export async function translateAnalysisResult(
  data: {
    verdict: string;
    explanation: string;
    triggered_signals: string[];
    recommended_actions: string[];
  },
  targetLanguage: 'hi' | 'ta' | 'en',
): Promise<TranslationResult> {
  if (targetLanguage === 'en') {
    return {
      ...data,
      language: 'en',
    };
  }

  const langName = targetLanguage === 'hi' ? 'Hindi' : 'Tamil';
  const prompt = `Translate the following cyber fraud analysis report into natural, accurate ${langName}. Preserve technical clarity and legal advice accurately.

Input JSON:
${JSON.stringify(data, null, 2)}

Respond with valid JSON only in this exact format:
{
  "verdict": "<Translated verdict e.g. Scam Detected / Legitimate Communication in ${langName}>",
  "explanation": "<Translated explanation text>",
  "triggered_signals": ["<translated signal 1>", "<translated signal 2>", ...],
  "recommended_actions": ["<translated action 1>", "<translated action 2>", ...]
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      verdict: parsed.verdict || data.verdict,
      explanation: parsed.explanation || data.explanation,
      triggered_signals: Array.isArray(parsed.triggered_signals) ? parsed.triggered_signals : data.triggered_signals,
      recommended_actions: Array.isArray(parsed.recommended_actions) ? parsed.recommended_actions : data.recommended_actions,
      language: targetLanguage,
    };
  } catch (err) {
    logger.warn('Gemini translation failed — returning original English text', { error: String(err) });
    return {
      ...data,
      language: 'en',
    };
  }
}

