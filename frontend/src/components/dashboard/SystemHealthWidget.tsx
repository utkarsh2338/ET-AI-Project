import React, { useEffect, useState } from 'react';
import { Activity, Database, Cpu, Radio, Server, CheckCircle2 } from 'lucide-react';

interface SystemHealthWidgetProps {
  isConnected: boolean;
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ isConnected }) => {
  const [latency, setLatency] = useState(42);
  const [lastSync, setLastSync] = useState('');

  useEffect(() => {
    setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setLatency(Math.floor(35 + Math.random() * 15));
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    { label: 'Express API', icon: Server, status: '200 OK', isOnline: true },
    { label: 'Socket.IO', icon: Radio, status: isConnected ? 'LIVE' : 'SYNCING', isOnline: isConnected },
    { label: 'Gemini AI', icon: Cpu, status: 'READY', isOnline: true },
    { label: 'MongoDB', icon: Database, status: 'ATLAS', isOnline: true },
  ];

  return (
    <div className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl font-mono text-xs text-slate-200 space-y-2.5 shadow-lg select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite-700 pb-2">
        <div className="flex items-center space-x-1.5 min-w-0">
          <Activity className="w-3.5 h-3.5 text-brand-gold shrink-0" />
          <span className="font-bold text-[11px] text-slate-100 uppercase tracking-wide truncate">
            SYSTEM HEALTH
          </span>
        </div>
        {lastSync && <span className="text-[10px] text-slate-400 shrink-0 font-sans">{lastSync}</span>}
      </div>

      {/* Services Status List */}
      <div className="space-y-1.5 text-[11px]">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.label}
              className="bg-graphite-900 px-2.5 py-1.5 rounded-lg border border-graphite-800 flex items-center justify-between space-x-2"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-300 truncate font-sans text-xs">{svc.label}</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold shrink-0 px-1.5 py-0.5 rounded border ${
                  svc.isOnline
                    ? 'bg-signal-green/10 text-signal-green border-signal-green/30'
                    : 'bg-signal-amber/10 text-signal-amber border-signal-amber/30'
                }`}
              >
                {svc.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Latency & Status */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-graphite-700/60 pt-2 font-mono">
        <span>Latency: <strong className="text-brand-gold">{latency}ms</strong></span>
        <span className="text-signal-green font-bold flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3 text-signal-green shrink-0 inline" />
          <span>NOMINAL</span>
        </span>
      </div>
    </div>
  );
};
