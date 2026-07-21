export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReportStatus = 'Pending' | 'Verified' | 'Resolved';
export type ReportSource = 'Citizen' | 'Police' | 'Imported';
export type Trend = 'Increasing' | 'Stable' | 'Decreasing';

export type FraudCategory =
  | 'UPI Fraud'
  | 'Banking Fraud'
  | 'OTP Scam'
  | 'Phishing'
  | 'Lottery Scam'
  | 'Job Fraud'
  | 'Investment Scam'
  | 'KYC Scam'
  | 'Impersonation'
  | 'Other';

export interface Report {
  _id?: string;
  reportId: string;
  title: string;
  description: string;
  category: FraudCategory;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  severity: Severity;
  scamPrediction?: string;
  confidence?: number;
  status: ReportStatus;
  source: ReportSource;
}

export interface MapMarker {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  reportCount: number;
  hotspotScore: number;
  priorityLevel: PriorityLevel;
  severityIndex: number;
  latestIncident: string | null;
  geminiRecommendation: string;
  geminiPriority: PriorityLevel;
  trend: Trend;
  criticalCount: number;
  verifiedCount: number;
}

export interface DashboardSummary {
  totalReports: number;
  criticalReports: number;
  verifiedReports: number;
  todayReports: number;
  topHotspot: { district: string; state: string; hotspotScore: number } | null;
  averageSeverity: number;
  activeDistricts: number;
  liveConnections: number;
}

export interface AnalyticsData {
  reportsOverTime: Array<{ date: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  severityDistribution: Array<{ severity: string; count: number }>;
  topDistricts: Array<{ district: string; state: string; hotspotScore: number; reportCount: number }>;
}

export interface DistrictDetail {
  stats: MapMarker | null;
  recentReports: Report[];
  categoryBreakdown: Array<{ category: string; count: number }>;
}

export interface FilterState {
  state: string;
  district: string;
  severity: string;
  status: string;
  category: string;
  search: string;
}

export interface ChatMessageResult {
  prediction: string;
  confidence: number;
  risk: string;
  explanation: string;
  triggeredSignals: string[];
  recommendedActions?: string[];
  language?: 'en' | 'hi' | 'ta';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  result?: ChatMessageResult;
  translatedResult?: ChatMessageResult;
  currentLanguage?: 'en' | 'hi' | 'ta';
  isTranslating?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface PrefillReportData {
  title?: string;
  description?: string;
  category?: string;
  district?: string;
  state?: string;
  severity?: Severity;
  scamPrediction?: string;
  confidence?: number;
}

