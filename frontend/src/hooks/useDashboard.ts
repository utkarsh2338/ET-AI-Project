import { useEffect, useState, useCallback } from 'react';
import { fetchDashboard } from '../lib/api';
import { useSocket, NewReportEvent, HotspotUpdateEvent } from './useSocket';
import { DashboardSummary, MapMarker, AnalyticsData } from '../types';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboard();
      setSummary(data.summary);
      setMarkers(data.markers);
      setAnalytics(data.analytics);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNewReport = useCallback((event: NewReportEvent) => {
    // Optimistically update summary metrics
    setSummary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        totalReports: prev.totalReports + 1,
        todayReports: prev.todayReports + 1,
        criticalReports: event.report.severity === 'Critical' ? prev.criticalReports + 1 : prev.criticalReports,
      };
    });

    // Update markers array
    setMarkers((prev) => {
      const idx = prev.findIndex((m) => m.district === event.districtStats.district);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = event.districtStats;
        return updated.sort((a, b) => b.hotspotScore - a.hotspotScore);
      }
      return [event.districtStats, ...prev].sort((a, b) => b.hotspotScore - a.hotspotScore);
    });
  }, []);

  const handleHotspotUpdate = useCallback((event: HotspotUpdateEvent) => {
    setMarkers((prev) => {
      const idx = prev.findIndex((m) => m.district === event.districtStats.district);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = event.districtStats;
        return updated.sort((a, b) => b.hotspotScore - a.hotspotScore);
      }
      return [event.districtStats, ...prev].sort((a, b) => b.hotspotScore - a.hotspotScore);
    });
  }, []);

  const { isConnected, liveConnections, recentEvents } = useSocket(handleNewReport, handleHotspotUpdate);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    summary,
    markers,
    analytics,
    loading,
    error,
    refresh: loadData,
    isConnected,
    liveConnections,
    recentEvents,
  };
}
