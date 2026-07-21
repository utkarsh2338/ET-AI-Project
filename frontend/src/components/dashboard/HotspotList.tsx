import React, { useState } from 'react';
import { Flame, Search, ChevronRight } from 'lucide-react';
import { MapMarker } from '../../types';

interface HotspotListProps {
  markers: MapMarker[];
  onSelectDistrict: (marker: MapMarker) => void;
  selectedDistrict: MapMarker | null;
}

function getPriorityBadge(score: number): { label: string; classNames: string } {
  if (score > 80) return { label: 'CRITICAL', classNames: 'bg-signal-red/20 text-signal-red border-signal-red/40' };
  if (score > 60) return { label: 'HIGH',     classNames: 'bg-signal-orange/20 text-signal-orange border-signal-orange/40' };
  if (score > 30) return { label: 'WARNING',  classNames: 'bg-signal-amber/20 text-signal-amber border-signal-amber/40' };
  return { label: 'MONITORING', classNames: 'bg-signal-green/20 text-signal-green border-signal-green/40' };
}

export const HotspotList: React.FC<HotspotListProps> = ({
  markers,
  onSelectDistrict,
  selectedDistrict,
}) => {
  const [search, setSearch] = useState('');

  const filtered = markers.filter(
    (m) =>
      m.district.toLowerCase().includes(search.toLowerCase()) ||
      m.state.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-graphite-900 border border-graphite-700 rounded-2xl flex flex-col h-full overflow-hidden shadow-xl">
      {/* List Header */}
      <div className="p-4 border-b border-graphite-700 bg-graphite-850 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-brand-gold inline" />
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
              ACTIVE CLUSTERS ({filtered.length})
            </h3>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search district or state..."
            className="w-full bg-graphite-950 border border-graphite-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-brand-purple"
          />
        </div>
      </div>

      {/* List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center text-xs font-mono text-slate-500 py-8">
            No hotspots match search
          </div>
        ) : (
          filtered.map((m) => {
            const badge = getPriorityBadge(m.hotspotScore);
            const isSelected = selectedDistrict?.district === m.district;

            return (
              <div
                key={`${m.district}-${m.state}`}
                onClick={() => onSelectDistrict(m)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-graphite-800 border-brand-purple shadow-glow-purple/20'
                    : 'bg-graphite-850 border-graphite-700 hover:border-slate-500 hover:bg-graphite-800/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-serif font-bold text-sm text-slate-100 flex items-center space-x-2">
                      <span>{m.district}</span>
                      <span className="text-xs font-sans text-slate-400 font-normal">({m.state})</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center space-x-3">
                      <span>Incidents: <strong className="text-slate-200">{m.reportCount}</strong></span>
                      <span>Score: <strong className="text-brand-gold">{m.hotspotScore}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${badge.classNames}`}>
                      {badge.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-graphite-950 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${m.hotspotScore}%`,
                      backgroundColor:
                        m.hotspotScore > 80
                          ? '#EF4444'
                          : m.hotspotScore > 60
                          ? '#F97316'
                          : m.hotspotScore > 30
                          ? '#F59E0B'
                          : '#10B981',
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
