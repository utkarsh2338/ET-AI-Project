import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Sparkles, TrendingUp, ShieldAlert, FileText } from 'lucide-react';
import { MapMarker, Report } from '../../types';
import { fetchDistrictDetail } from '../../lib/api';

interface DistrictPopupProps {
  marker: MapMarker;
  onClose: () => void;
}

function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'Critical': return 'bg-signal-red/20 text-signal-red border-signal-red/40';
    case 'High':     return 'bg-signal-orange/20 text-signal-orange border-signal-orange/40';
    case 'Medium':   return 'bg-signal-amber/20 text-signal-amber border-signal-amber/40';
    default:         return 'bg-signal-green/20 text-signal-green border-signal-green/40';
  }
}

export const DistrictPopup: React.FC<DistrictPopupProps> = ({ marker, onClose }) => {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        const detail = await fetchDistrictDetail(marker.district);
        setRecentReports(detail.recentReports || []);
        setCategories(detail.categoryBreakdown || []);
      } catch (err) {
        console.error('Failed to load district detail:', err);
      } finally {
        setLoading(false);
      }
    }
    void loadDetail();
  }, [marker.district]);

  return (
    <div className="absolute top-4 right-4 bottom-4 w-96 bg-graphite-900/95 backdrop-blur-xl border border-graphite-700 rounded-2xl shadow-2xl flex flex-col z-20 overflow-hidden text-slate-200 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-graphite-700 flex items-start justify-between bg-graphite-850">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-serif font-bold text-2xl text-slate-100">{marker.district}</h2>
            <span className="text-xs font-mono text-slate-400">({marker.state})</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            LAT: {marker.latitude.toFixed(4)} | LON: {marker.longitude.toFixed(4)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-graphite-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Hotspot Score Banner */}
        <div className="bg-graphite-800 border border-graphite-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              HOTSPOT RISK SCORE
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="font-mono text-4xl font-extrabold text-slate-100">
                {marker.hotspotScore}
              </span>
              <span className="text-sm font-mono text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 text-xs font-mono font-bold rounded-lg border ${getPriorityBadgeClass(marker.priorityLevel)}`}>
              {marker.priorityLevel.toUpperCase()}
            </span>
            <div className="flex items-center space-x-1 text-xs font-mono text-slate-400 mt-2 justify-end">
              <TrendingUp className="w-3.5 h-3.5 text-brand-gold" />
              <span>Trend: {marker.trend}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 font-mono text-center">
          <div className="bg-graphite-850 border border-graphite-700 p-2.5 rounded-xl">
            <div className="text-slate-400 text-[10px]">TOTAL</div>
            <div className="text-lg font-bold text-slate-100">{marker.reportCount}</div>
          </div>
          <div className="bg-graphite-850 border border-graphite-700 p-2.5 rounded-xl">
            <div className="text-slate-400 text-[10px]">CRITICAL</div>
            <div className="text-lg font-bold text-signal-red">{marker.criticalCount}</div>
          </div>
          <div className="bg-graphite-850 border border-graphite-700 p-2.5 rounded-xl">
            <div className="text-slate-400 text-[10px]">VERIFIED</div>
            <div className="text-lg font-bold text-signal-green">{marker.verifiedCount}</div>
          </div>
        </div>

        {/* Gemini AI Law Enforcement Recommendation Box */}
        <div className="bg-gradient-to-br from-brand-indigo/30 via-graphite-850 to-graphite-850 border border-brand-purple/40 rounded-xl p-4 shadow-glow-purple">
          <div className="flex items-center space-x-2 text-brand-gold font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-brand-gold inline animate-pulse" />
            <span>AI ENFORCEMENT RECOMMENDATION</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {marker.geminiRecommendation ||
              'High priority district requiring immediate deployment of cyber patrol units and citizen awareness advisories.'}
          </p>
        </div>

        {/* Category Breakdown */}
        {categories.length > 0 && (
          <div>
            <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>FRAUD CATEGORY BREAKDOWN</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {categories.slice(0, 5).map((cat) => (
                <div key={cat.category} className="flex items-center justify-between bg-graphite-850 p-2 rounded-lg border border-graphite-700">
                  <span className="text-slate-300">{cat.category}</span>
                  <span className="font-bold text-brand-gold">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Incidents */}
        <div>
          <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5" />
            <span>RECENT INCIDENTS</span>
          </div>
          {loading ? (
            <div className="text-xs font-mono text-slate-500 py-4 text-center">Loading incidents...</div>
          ) : recentReports.length === 0 ? (
            <div className="text-xs font-mono text-slate-500 py-4 text-center">No recent incidents logged</div>
          ) : (
            <div className="space-y-2">
              {recentReports.slice(0, 4).map((r) => (
                <div key={r.reportId} className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate max-w-[200px]">{r.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getPriorityBadgeClass(r.severity)}`}>
                      {r.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{r.description}</p>
                  <div className="text-[10px] font-mono text-slate-500 flex justify-between pt-1">
                    <span>{r.reportId}</span>
                    <span>{new Date(r.timestamp).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
