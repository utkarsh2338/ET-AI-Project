import React from 'react';
import { Radio, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { NewReportEvent } from '../../hooks/useSocket';

interface LiveFeedProps {
  events: NewReportEvent[];
}

function getSeverityBadge(severity: string): string {
  switch (severity) {
    case 'Critical': return 'bg-signal-red/20 text-signal-red border-signal-red/40';
    case 'High':     return 'bg-signal-orange/20 text-signal-orange border-signal-orange/40';
    case 'Medium':   return 'bg-signal-amber/20 text-signal-amber border-signal-amber/40';
    default:         return 'bg-signal-green/20 text-signal-green border-signal-green/40';
  }
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ events }) => {
  return (
    <div className="bg-graphite-900 border border-graphite-700 rounded-2xl flex flex-col h-full overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-graphite-700 bg-graphite-850 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-signal-green inline animate-pulse" />
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
            REAL-TIME INCIDENT FEED
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-graphite-950 text-slate-400 border border-graphite-700">
          SOCKET.IO BROADCAST
        </span>
      </div>

      {/* Feed Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-12 px-4 font-mono space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-xs text-slate-400">Monitoring national grid...</div>
            <div className="text-[10px] text-slate-400">
              New citizen reports submitted to the backend will stream live here automatically without page refresh.
            </div>
          </div>
        ) : (
          events.map((evt, idx) => (
            <div
              key={`${evt.report.reportId}-${idx}`}
              className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-100 truncate max-w-[200px]">
                  {evt.report.title}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border rounded ${getSeverityBadge(evt.report.severity)}`}>
                  {evt.report.severity}
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">{evt.report.description}</p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-graphite-800">
                <span className="text-brand-gold">{evt.report.district}, {evt.report.state}</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 inline" />
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
