import React from 'react';
import { Shield, Radio, Map, FileText, CheckCircle2, RefreshCw, Play, Network, HelpCircle, Settings } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface NavbarProps {
  activeTab: 'map' | 'reports' | 'checker' | 'analytics';
  setActiveTab: (tab: 'map' | 'reports' | 'checker' | 'analytics') => void;
  isConnected: boolean;
  liveConnections: number;
  onRefresh?: () => void;
  onRunDemo?: () => void;
  onOpenArchitecture?: () => void;
  onStartTour?: () => void;
  onOpenSettings?: () => void;
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isConnected,
  liveConnections,
  onRefresh,
  onRunDemo,
  onOpenArchitecture,
  onStartTour,
  onOpenSettings,
  onNavigateHome,
}) => {
  const { t } = useI18n();

  function handleLogoClick() {
    if (onNavigateHome) onNavigateHome();
    else setActiveTab('map');
  }

  return (
    <header className="h-16 bg-graphite-900 border-b border-graphite-700 px-6 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Identity — Click Logo to Navigate Home */}
      <div
        onClick={handleLogoClick}
        className="flex items-center space-x-4 cursor-pointer group transition-transform hover:scale-[1.01]"
        title="Navigate to Home Dashboard"
      >
        <div className="w-10 h-10 rounded-xl bg-brand-indigo/30 border border-brand-purple/40 flex items-center justify-center text-brand-gold shadow-glow-purple group-hover:border-brand-gold">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif font-bold text-xl text-slate-100 tracking-wide group-hover:text-brand-gold transition-colors">
              {t('appName')}
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-brand-purple/20 text-brand-gold border border-brand-purple/40 rounded-md uppercase tracking-wider">
              {t('commandCenter')}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {t('tagline')}
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
          <span>{t('navMap')}</span>
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
          <span>{t('navReports')}</span>
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
          <span>{t('navChecker')}</span>
        </button>
      </nav>

      {/* Real-time Connection Badge & Controls */}
      <div className="flex items-center space-x-3">
        {/* Run Demo Button */}
        {onRunDemo && (
          <button
            onClick={onRunDemo}
            className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-purple hover:to-brand-indigo text-white font-mono text-xs font-bold py-1.5 px-3.5 rounded-xl shadow-glow-purple flex items-center space-x-1.5 transition-all border border-brand-purple/50"
            title="Run Hackathon Automated Demo"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{t('runDemo')}</span>
          </button>
        )}

        {/* System Architecture Button */}
        {onOpenArchitecture && (
          <button
            onClick={onOpenArchitecture}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-graphite-800 rounded-lg transition-colors border border-graphite-700 flex items-center space-x-1 font-mono text-xs"
            title="System Architecture"
          >
            <Network className="w-4 h-4 text-brand-gold" />
            <span className="hidden md:inline">{t('architecture')}</span>
          </button>
        )}

        {/* Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-graphite-800 rounded-lg transition-colors border border-graphite-700"
            title="System Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Guided Tour Trigger */}
        {onStartTour && (
          <button
            onClick={onStartTour}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-graphite-800 rounded-lg transition-colors border border-graphite-700"
            title="Start Guided Tour"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-graphite-800 rounded-lg transition-colors border border-graphite-700"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Connection Indicator Status (🟢 Online in Green) */}
        <div className="flex items-center space-x-2 bg-graphite-950 border border-graphite-700 px-3 py-1.5 rounded-lg text-xs font-mono">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-signal-green animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-green" />
          </div>
          <span className="text-signal-green font-medium font-mono">
            🟢 Online
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 flex items-center space-x-1">
            <Radio className="w-3 h-3 text-signal-green inline" />
            <span>{liveConnections || 1} Active</span>
          </span>
        </div>
      </div>
    </header>
  );
};


