import React from 'react';
import { Shield, Radio, Map, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'reports' | 'checker' | 'analytics';
  setActiveTab: (tab: 'map' | 'reports' | 'checker' | 'analytics') => void;
  isConnected: boolean;
  liveConnections: number;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isConnected,
  liveConnections,
  onRefresh,
}) => {
  return (
    <header className="h-16 bg-graphite-900 border-b border-graphite-700 px-6 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-xl bg-brand-indigo/30 border border-brand-purple/40 flex items-center justify-center text-brand-gold shadow-glow-purple">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif font-bold text-xl text-slate-100 tracking-wide">
              Citizen Fraud Shield
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-brand-purple/20 text-brand-gold border border-brand-purple/40 rounded-md uppercase tracking-wider">
              Command Center
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            National Cyber Fraud Detection & Response Grid
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-graphite-950/70 p-1 rounded-xl border border-graphite-700">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'map'
              ? 'bg-brand-indigo text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-graphite-800/50'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Geospatial Map</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'reports'
              ? 'bg-brand-indigo text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-graphite-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Live Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('checker')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'checker'
              ? 'bg-brand-indigo text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-graphite-800/50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>AI Scam Checker</span>
        </button>
      </nav>

      {/* Real-time Connection Badge & Controls */}
      <div className="flex items-center space-x-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-graphite-800 rounded-lg transition-colors border border-graphite-700"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-2 bg-graphite-950 border border-graphite-700 px-3 py-1.5 rounded-lg text-xs font-mono">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-signal-green animate-ping' : 'bg-signal-red'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-signal-green' : 'bg-signal-red'
              }`}
            />
          </div>
          <span className={isConnected ? 'text-signal-green font-medium' : 'text-signal-red'}>
            {isConnected ? 'LIVE FEED' : 'OFFLINE'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 flex items-center space-x-1">
            <Radio className="w-3 h-3 text-slate-400 inline" />
            <span>{liveConnections} Active</span>
          </span>
        </div>
      </div>
    </header>
  );
};
