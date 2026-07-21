import { DashboardSummary, MapMarker, AnalyticsData, Report, DistrictDetail, FilterState } from '../types';

const API_BASE = '/api';

export async function fetchDashboard(): Promise<{
  summary: DashboardSummary;
  markers: MapMarker[];
  analytics: AnalyticsData;
}> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function fetchHotspots(): Promise<MapMarker[]> {
  const res = await fetch(`${API_BASE}/hotspots`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  return json.data.hotspots;
}

export async function fetchReports(
  filters: Partial<FilterState> = {},
  page = 1,
  limit = 20,
): Promise<{ reports: Report[]; total: number; page: number; pages: number }> {
  const params = new URLSearchParams();
  if (filters.state)    params.set('state', filters.state);
  if (filters.district) params.set('district', filters.district);
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.status)   params.set('status', filters.status);
  if (filters.category) params.set('category', filters.category);
  if (filters.search)   params.set('search', filters.search);
  params.set('page', String(page));
  params.set('limit', String(limit));

  const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function fetchDistrictDetail(districtName: string): Promise<DistrictDetail> {
  const res = await fetch(`${API_BASE}/district/${encodeURIComponent(districtName)}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function submitReport(reportData: {
  title: string;
  description: string;
  category: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  severity: string;
}): Promise<{ reportId: string; status: string; message: string }> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Failed to submit report');
  }
  return json.data;
}

export async function analyzeScamText(message: string): Promise<{
  prediction: string;
  confidence: number;
  risk: string;
  explanation: string;
  triggeredSignals: string[];
}> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Prediction failed');
  }
  return json.data;
}
