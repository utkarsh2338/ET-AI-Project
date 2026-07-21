export interface UrgencyAnalysis {
  urgency_score: number;         // 0–10 score based on matched keywords
  matched_keywords: string[];
}

/** Result of authority impersonation detection */
export interface AuthorityAnalysis {
  authority_impersonation: boolean;
  matched_entities: string[];
}

/** Result of payment-related phrase detection */
export interface PaymentAnalysis {
  payment_request: boolean;
  payment_keywords: string[];
}

/** Result of OTP/verification code detection */
export interface OTPAnalysis {
  otp_request: boolean;
  otp_keywords: string[];
}

/** Result of URL analysis */
export interface LinkAnalysis {
  url_count: number;
  contains_shortened_url: boolean;
  contains_ip_url: boolean;
  suspicious_domains: string[];
}

/** Result of threatening language detection */
export interface ThreatAnalysis {
  threat_score: number;          // 0–10 score based on matched threat phrases
  threat_keywords: string[];
}

/** Result of reward/lottery keyword detection */
export interface RewardAnalysis {
  reward_or_lottery: boolean;
  reward_keywords: string[];
}

/** Grammar quality classification */
export type GrammarQuality = 'poor' | 'medium' | 'good';

/** Result of grammar heuristic analysis */
export interface GrammarAnalysis {
  grammar_quality: GrammarQuality;
  uppercase_ratio: number;       // 0.0 – 1.0
  exclamation_count: number;
  punctuation_density: number;   // punctuation chars / total chars
}

/** Raw message metadata statistics */
export interface MessageMetadata {
  message_length: number;
  word_count: number;
  digit_ratio: number;           // digit chars / total chars
  emoji_count: number;
  currency_symbol_count: number;
  phone_number_count: number;
  email_count: number;
}

export interface ExtractedFeatures {
  // Urgency
  urgency_score: number;
  matched_urgency_keywords: string[];

  // Authority Impersonation
  authority_impersonation: boolean;
  matched_authority_entities: string[];

  // Payment
  payment_request: boolean;
  payment_keywords: string[];

  // OTP
  otp_request: boolean;
  otp_keywords: string[];

  // Links
  url_count: number;
  contains_shortened_url: boolean;
  contains_ip_url: boolean;
  suspicious_domains: string[];

  // Threats
  threat_score: number;
  threat_keywords: string[];

  // Rewards / Lottery
  reward_or_lottery: boolean;
  reward_keywords: string[];

  // Crypto / Bank
  crypto_keywords: boolean;
  bank_keywords: boolean;

  // Grammar
  grammar_quality: GrammarQuality;
  uppercase_ratio: number;
  exclamation_count: number;
  punctuation_density: number;

  // Metadata
  message_length: number;
  word_count: number;
  digit_ratio: number;
  emoji_count: number;
  currency_symbol_count: number;
  phone_number_count: number;
  email_count: number;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

/** Verdict from the Gemini reasoning layer */
export type Verdict = 'Scam' | 'Likely Scam' | 'Needs Manual Review' | 'Unable to Determine' | 'Safe' | 'Legitimate';

/** Structured response from Gemini API */
export interface GeminiAnalysisResult {
  verdict: Verdict;
  confidence: number;             // 0–100
  explanation: string;
  triggered_signals: string[];
  risk_level: RiskLevel;
}

/** Complete prediction result returned to client */
export interface PredictionResult {
  prediction: Verdict;
  confidence: number;
  risk: RiskLevel;
  explanation: string;
  features: ExtractedFeatures;
  triggeredSignals: string[];
}

export interface AnalyzeRequest {
  message: string;
}

/** POST /predict response body */
export interface AnalyzeResponse {
  success: boolean;
  data: PredictionResult;
  meta: {
    processingTimeMs: number;
    timestamp: string;
  };
}

/** POST /extract-features response body */
export interface ExtractFeaturesResponse {
  success: boolean;
  data: {
    features: ExtractedFeatures;
  };
  meta: {
    processingTimeMs: number;
    timestamp: string;
  };
}

/** Standard error response */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
  };
}

export interface DatasetRow {
  message: string;
  label: 0 | 1;  // 0 = legitimate, 1 = scam
}

/** Result of classifying a single dataset message */
export interface ValidationResult {
  message: string;
  expectedLabel: 0 | 1;
  predictedLabel: 0 | 1;
  confidence: number;
  correct: boolean;
}

/** Aggregate validation metrics */
export interface ValidationMetrics {
  totalSamples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  confusionMatrix: {
    truePositives: number;
    trueNegatives: number;
    falsePositives: number;
    falseNegatives: number;
  };
}
