import React, { useState } from 'react';
import { Activity, Flame, BarChart3, PlusCircle, Settings, Download, ChevronLeft, ChevronRight, Keyboard, Clock } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { SystemHealthWidget } from '../dashboard/SystemHealthWidget';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onOpenReportModal: () => void;
  onOpenSettings?: () => void;
  onOpenShortcuts?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenReportModal,
  onOpenSettings,
  onOpenShortcuts,
}) => {
  const { t } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Live Monitor', icon: Activity },
    { id: 'hotspots', label: 'Hotspots', icon: Flame },
    { id: 'analytics', label: 'Analytic Feed', icon: BarChart3 },
    { id: 'timeline', label: 'Activity Timeline', icon: Clock },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-graphite-900 border-r border-graphite-700 flex flex-col justify-between shrink-0 z-20 transition-all duration-300 relative select-none`}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 w-6 h-6 bg-graphite-850 border border-graphite-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white shadow-md z-30"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Upper Navigation Section */}
      <div className="p-4 space-y-4 overflow-x-hidden overflow-y-auto">
        {/* Analyst Profile Box */}
        {!isCollapsed && (
          <div className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-brand-purple/20 border border-brand-purple/40 text-brand-gold flex items-center justify-center font-mono font-bold text-sm">
              A7
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">{t('commandCenter')}</div>
              <div className="text-[10px] font-mono text-slate-400">ANALYST ALPHA-7</div>
            </div>
          </div>
        )}

        {/* System Health Widget */}
        {!isCollapsed && <SystemHealthWidget isConnected={true} />}

        {/* Action Button: Citizen Report */}
        <button
          onClick={onOpenReportModal}
          className={`w-full bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-purple hover:to-brand-indigo text-white font-medium py-2.5 px-3 rounded-xl shadow-glow-purple flex items-center justify-center space-x-2 transition-all duration-200 ${
            isCollapsed ? 'p-2' : ''
          }`}
          title="Submit Fraud Report"
        >
          <PlusCircle className="w-4 h-4 shrink-0 text-brand-gold" />
          {!isCollapsed && <span className="text-sm truncate">Submit Report</span>}
        </button>

        {/* Nav Links */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
              GRID NAVIGATION
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                title={item.label}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-graphite-800 text-slate-100 border border-graphite-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-graphite-850/50'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} ${isActive ? 'text-brand-gold' : 'text-slate-400'} shrink-0`} />
                {!isCollapsed && <span>{item.label}</span>}
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
          className={`w-full bg-graphite-850 hover:bg-graphite-800 text-slate-300 border border-graphite-700 py-2 px-3 rounded-xl text-xs font-mono flex items-center justify-center space-x-2 transition-colors ${
            isCollapsed ? 'p-2' : ''
          }`}
          title="Export JSON Data"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Export Data</span>}
        </button>

        {!isCollapsed && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1 hover:text-white transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
              <span>{t('settings')}</span>
            </button>

            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="text-slate-400 hover:text-brand-gold flex items-center space-x-1"
                title="Keyboard Shortcuts"
              >
                <Keyboard className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

