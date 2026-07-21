import React, { useState } from 'react';
import { Activity, ShieldAlert, Cpu, Radio, MapPin, Filter, Search, CheckCircle2 } from 'lucide-react';
import { Report } from '../types';

interface TimelineEvent {
  id: string;
  type: 'report' | 'prediction' | 'hotspot' | 'system';
  title: string;
  description: string;
  timestamp: string;
  district?: string;
  severity?: string;
}

interface TimelinePageProps {
  reports?: Report[];
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ reports = [] }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const events: TimelineEvent[] = [
    {
      id: 'ev-1',
      type: 'system',
      title: 'Command Center Initialized',
      description: 'Connected to MongoDB Atlas & Socket.IO real-time fraud grid stream.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'ev-2',
      type: 'hotspot',
      title: 'Hotspot Recalculated: Lucknow',
      description: 'Hotspot score updated to 88/100 (Critical Priority Level). Gemini action recommended.',
      timestamp: new Date(Date.now() - 2700000).toISOString(),
      district: 'Lucknow',
      severity: 'Critical',
    },
    {
      id: 'ev-3',
      type: 'prediction',
      title: 'AI Scam Verification Completed',
      description: 'Message flagged as Scam (94% Confidence). Red flags: Urgency, OTP Request, impersonation.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      severity: 'Critical',
    },
    ...reports.map((r) => ({
      id: `ev-rep-${r.reportId}`,
      type: 'report' as const,
      title: `Citizen Report Submitted — ${r.district}`,
      description: `${r.title} (${r.category})`,
      timestamp: r.timestamp || new Date().toISOString(),
      district: r.district,
      severity: r.severity,
    })),
  ];

  const filtered = events.filter((ev) => {
    if (filterType !== 'all' && ev.type !== filterType) return false;
    if (searchQuery && !ev.title.toLowerCase().includes(searchQuery.toLowerCase()) && !ev.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 text-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite-700 pb-4 mb-6 shrink-0 select-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/40 text-brand-gold flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-100">Live Activity Timeline</h2>
            <p className="text-xs font-mono text-slate-400">
              Chronological log of citizen reports, AI predictions, hotspot recalculations, and grid alerts
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline..."
              className="bg-graphite-900 border border-graphite-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-purple"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-graphite-900 border border-graphite-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Event Types</option>
            <option value="report">Citizen Reports</option>
            <option value="prediction">AI Predictions</option>
            <option value="hotspot">Hotspot Updates</option>
            <option value="system">System Logs</option>
          </select>
        </div>
      </div>

      {/* Timeline Event Stream */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-graphite-800" />

        {filtered.map((ev) => {
          const icons = {
            report: <ShieldAlert className="w-4 h-4 text-signal-red" />,
            prediction: <Cpu className="w-4 h-4 text-brand-gold" />,
            hotspot: <MapPin className="w-4 h-4 text-signal-amber" />,
            system: <Radio className="w-4 h-4 text-blue-400" />,
          };

          return (
            <div key={ev.id} className="flex items-start space-x-4 pl-3 relative group">
              <div className="w-7 h-7 rounded-full bg-graphite-900 border border-graphite-700 flex items-center justify-center shrink-0 z-10 group-hover:border-brand-purple">
                {icons[ev.type]}
              </div>

              <div className="flex-1 bg-graphite-900 border border-graphite-700 group-hover:border-graphite-600 p-4 rounded-2xl shadow-md transition-all">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-slate-200">{ev.title}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans mt-1">{ev.description}</p>
                {ev.district && (
                  <div className="mt-2 text-[10px] font-mono text-brand-gold flex items-center space-x-2">
                    <span>District: {ev.district}</span>
                    {ev.severity && (
                      <span className="px-2 py-0.5 rounded bg-signal-red/20 text-signal-red border border-signal-red/40 font-bold">
                        {ev.severity}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
