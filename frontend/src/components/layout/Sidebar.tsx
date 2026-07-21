import React from 'react';
import { Activity, Flame, BarChart3, PlusCircle, Settings, Download } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onOpenReportModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenReportModal,
}) => {
  const navItems = [
    { id: 'overview', label: 'Live Monitor', icon: Activity },
    { id: 'hotspots', label: 'Hotspots', icon: Flame },
    { id: 'analytics', label: 'Analytic Feed', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-graphite-900 border-r border-graphite-700 flex flex-col justify-between shrink-0 z-20">
      {/* Upper Navigation Section */}
      <div className="p-4 space-y-6">
        {/* Analyst Profile Box */}
        <div className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand-purple/20 border border-brand-purple/40 text-brand-gold flex items-center justify-center font-mono font-bold text-sm">
            A7
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">Command Center</div>
            <div className="text-[10px] font-mono text-slate-400">ANALYST ALPHA-7</div>
          </div>
        </div>

        {/* Action Button: Citizen Report */}
        <button
          onClick={onOpenReportModal}
          className="w-full bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-purple hover:to-brand-indigo text-white font-medium py-2.5 px-4 rounded-xl shadow-glow-purple flex items-center justify-center space-x-2 transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="text-sm">Submit Fraud Report</span>
        </button>

        {/* Nav Links */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
            GRID NAVIGATION
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-graphite-800 text-slate-100 border border-graphite-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-graphite-850/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-gold' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lower Footer Section */}
      <div className="p-4 border-t border-graphite-700 space-y-3">
        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ exportedAt: new Date().toISOString() }));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `fraud_report_export_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="w-full bg-graphite-850 hover:bg-graphite-800 text-slate-300 border border-graphite-700 py-2 px-3 rounded-xl text-xs font-mono flex items-center justify-center space-x-2 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report Data</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
          <span className="flex items-center space-x-1">
            <Settings className="w-3 h-3 text-slate-400 inline" />
            <span>Settings</span>
          </span>
          <span>v2.4.0-GRID</span>
        </div>
      </div>
    </aside>
  );
};
