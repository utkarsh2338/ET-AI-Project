import React from 'react';

interface StatusBarProps {
  activeDistricts: number;
  totalReports: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeDistricts, totalReports }) => {
  return (
    <footer className="h-8 bg-graphite-950 border-t border-graphite-700 px-6 flex items-center justify-between shrink-0 text-xs font-mono text-slate-400 z-30 select-none">
      <div className="flex items-center space-x-4">
        <span className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-signal-green inline-block animate-pulse" />
          <span className="text-slate-300 font-semibold">SYSTEMS NOMINAL</span>
        </span>
        <span className="text-slate-600">|</span>
        <span>FEED: 142.9 KB/s</span>
        <span className="text-slate-600">|</span>
        <span>ACTIVE CLUSTERS: {activeDistricts} DISTRICTS</span>
      </div>

      <div className="flex items-center space-x-4">
        <span>TOTAL INDEXED INCIDENTS: {totalReports}</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">© 2026 Citizen Fraud Shield. Official Government Resource.</span>
      </div>
    </footer>
  );
};
