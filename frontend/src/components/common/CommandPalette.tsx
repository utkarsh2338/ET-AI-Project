import React, { useState, useEffect } from 'react';
import { Search, Map, FileText, CheckCircle2, Settings, Play, HelpCircle, Network, X } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: 'map' | 'reports' | 'checker' | 'analytics') => void;
  onOpenSettings: () => void;
  onRunDemo: () => void;
  onStartTour: () => void;
  onOpenArchitecture: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenSettings,
  onRunDemo,
  onStartTour,
  onOpenArchitecture,
}) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'nav-map',
      title: 'Geospatial Command Center',
      category: 'Navigation',
      icon: <Map className="w-4 h-4 text-brand-gold" />,
      action: () => {
        onNavigate('map');
        onClose();
      },
    },
    {
      id: 'nav-checker',
      title: 'AI Scam Checker',
      category: 'Navigation',
      icon: <CheckCircle2 className="w-4 h-4 text-brand-gold" />,
      action: () => {
        onNavigate('checker');
        onClose();
      },
    },
    {
      id: 'nav-reports',
      title: 'Live Incident Reports',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4 text-brand-gold" />,
      action: () => {
        onNavigate('reports');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      title: 'System Settings (Languages & Appearance)',
      category: 'Preferences',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      action: () => {
        onOpenSettings();
        onClose();
      },
    },
    {
      id: 'action-demo',
      title: 'Run Automated Hackathon Demo',
      category: 'Actions',
      icon: <Play className="w-4 h-4 text-brand-gold fill-brand-gold" />,
      action: () => {
        onRunDemo();
        onClose();
      },
    },
    {
      id: 'action-tour',
      title: 'Start Guided Onboarding Tour',
      category: 'Actions',
      icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
      action: () => {
        onStartTour();
        onClose();
      },
    },
    {
      id: 'action-arch',
      title: 'View System Architecture Diagram',
      category: 'System',
      icon: <Network className="w-4 h-4 text-brand-gold" />,
      action: () => {
        onOpenArchitecture();
        onClose();
      },
    },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
      <div className="bg-graphite-900 border border-brand-purple/60 w-full max-w-xl rounded-2xl shadow-glow-purple/40 overflow-hidden flex flex-col font-mono text-xs">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-graphite-700 bg-graphite-850 flex items-center space-x-3">
          <Search className="w-4 h-4 text-brand-gold shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search page... (Press Esc to close)"
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Options List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No matching commands found.</div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full p-3 rounded-xl hover:bg-graphite-800 text-left flex items-center justify-between text-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {cmd.icon}
                  <span className="font-bold">{cmd.title}</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase">{cmd.category}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-2.5 bg-graphite-950 border-t border-graphite-800 text-[10px] text-slate-500 flex justify-between">
          <span>Use Enter to select</span>
          <span>Ctrl + K shortcut</span>
        </div>
      </div>
    </div>
  );
};
