import React, { useState } from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { HotspotList } from '../components/dashboard/HotspotList';
import { LiveFeed } from '../components/dashboard/LiveFeed';
import { FraudMap } from '../components/map/FraudMap';
import { MapToolbar } from '../components/map/MapToolbar';
import { DistrictPopup } from '../components/map/DistrictPopup';
import { ReportsOverTime } from '../components/charts/ReportsOverTime';
import { CategoryPie } from '../components/charts/CategoryPie';
import { TopDistricts } from '../components/charts/TopDistricts';

import { useDashboard } from '../hooks/useDashboard';
import { MapMarker } from '../types';
import { AlertTriangle, CheckCircle, ShieldAlert, Clock, Award, Activity, Wifi, Layers } from 'lucide-react';

interface CommandCenterProps {
  currentView: string;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ currentView }) => {
  const { summary, markers, analytics, loading, error, isConnected, liveConnections, recentEvents } =
    useDashboard();

  const [selectedDistrict, setSelectedDistrict] = useState<MapMarker | null>(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  if (loading && !summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-graphite-950 font-mono text-slate-400 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-purple border-t-transparent animate-spin" />
        <div>Connecting to Cyber Fraud Command Grid...</div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-graphite-950 font-mono text-signal-red space-y-3">
        <AlertTriangle className="w-10 h-10" />
        <div>Failed to connect to backend grid: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-graphite-950">
      {/* View 1: Main Geospatial Live Monitor Map */}
      {currentView === 'overview' && (
        <div className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden p-4 space-y-4">
          {/* Top KPI Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            <StatCard
              title="Total Incidents"
              value={summary?.totalReports ?? 0}
              subtitle="Indexed across 50 districts"
              icon={Activity}
            />
            <StatCard
              title="Critical Hotspots"
              value={summary?.criticalReports ?? 0}
              subtitle="Requiring immediate enforcement"
              icon={AlertTriangle}
              color="red"
            />
            <StatCard
              title="Verified Reports"
              value={summary?.verifiedReports ?? 0}
              subtitle="Confirmed fraud patterns"
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Top Hotspot"
              value={summary?.topHotspot?.district ?? 'Lucknow'}
              subtitle={`Risk Score: ${summary?.topHotspot?.hotspotScore ?? 89}/100`}
              icon={Award}
              color="purple"
            />
          </div>

          {/* Main 3-Column Workspace */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
            {/* Left 3 cols: Hotspots List */}
            <div className="col-span-1 lg:col-span-3 h-72 lg:h-full min-h-0">
              <HotspotList
                markers={markers}
                onSelectDistrict={setSelectedDistrict}
                selectedDistrict={selectedDistrict}
              />
            </div>

            {/* Middle 6 cols: Geospatial Map Canvas */}
            <div className="col-span-1 lg:col-span-6 h-96 lg:h-full min-h-0 relative bg-graphite-900 border border-graphite-700 rounded-2xl overflow-hidden shadow-2xl">
              <MapToolbar
                showMarkers={showMarkers}
                setShowMarkers={setShowMarkers}
                showHeatmap={showHeatmap}
                setShowHeatmap={setShowHeatmap}
              />
              <FraudMap
                markers={markers}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={setSelectedDistrict}
                showMarkers={showMarkers}
                showHeatmap={showHeatmap}
              />
              {selectedDistrict && (
                <DistrictPopup
                  marker={selectedDistrict}
                  onClose={() => setSelectedDistrict(null)}
                />
              )}
            </div>

            {/* Right 3 cols: Live Socket.IO Incident Stream */}
            <div className="col-span-1 lg:col-span-3 h-72 lg:h-full min-h-0">
              <LiveFeed events={recentEvents} />
            </div>
          </div>
        </div>
      )}

      {/* View 2: Dedicated Hotspots Deep-Dive */}
      {currentView === 'hotspots' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-2xl text-slate-100">Hotspot Prioritization Grid</h2>
              <p className="text-xs font-mono text-slate-400">
                Sorted by Hotspot Score = (Fraud Density × 0.5 + Severity × 0.3 + Recency × 0.2)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {markers.map((m) => (
              <div
                key={m.district}
                onClick={() => setSelectedDistrict(m)}
                className="bg-graphite-900 border border-graphite-700 rounded-2xl p-5 space-y-4 hover:border-brand-purple transition-all cursor-pointer shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-100">{m.district}</h3>
                    <p className="text-xs font-mono text-slate-400">{m.state}</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-signal-red/20 text-signal-red border border-signal-red/40">
                    SCORE: {m.hotspotScore}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3 bg-graphite-850 p-3 rounded-xl border border-graphite-800">
                  {m.geminiRecommendation || 'High density scam cluster detected.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 border-t border-graphite-800 pt-3">
                  <div>Incidents: <strong className="text-slate-200">{m.reportCount}</strong></div>
                  <div>Priority: <strong className="text-brand-gold">{m.priorityLevel}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Analytic Feed Charts */}
      {currentView === 'analytics' && analytics && (
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="font-serif font-bold text-2xl text-slate-100">National Fraud Analytics & Trends</h2>
            <p className="text-xs font-mono text-slate-400">Statistical aggregation derived from national citizen report data</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportsOverTime data={analytics.reportsOverTime} />
            <CategoryPie data={analytics.categoryDistribution} />
          </div>

          <div className="grid grid-cols-1">
            <TopDistricts data={analytics.topDistricts} />
          </div>
        </div>
      )}
    </div>
  );
};
