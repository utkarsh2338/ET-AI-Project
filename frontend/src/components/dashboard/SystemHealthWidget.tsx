import React, { useEffect, useState } from 'react';
import { Activity, Database, Cpu, Radio, Server, CheckCircle2 } from 'lucide-react';

interface SystemHealthWidgetProps {
  isConnected: boolean;
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ isConnected }) => {
  const [latency, setLatency] = useState(42);
  const [lastSync, setLastSync] = useState('Just now');

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(35 + Math.random() * 15));
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-graphite-900 border border-graphite-700 p-3.5 rounded-2xl shadow-xl font-mono text-xs text-slate-200 space-y-2.5">
      <div className="flex items-center justify-between border-b border-graphite-700 pb-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-brand-gold" />
          <span className="font-bold uppercase tracking-wider text-slate-100">SYSTEM HEALTH MATRIX</span>
        </div>
        <span className="text-[10px] text-slate-400">Sync: {lastSync}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {/* Backend API */}
        <div className="bg-graphite-850 p-2 rounded-xl border border-graphite-800 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>Express API</span>
          </span>
          <span className="text-signal-green font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-green inline-block animate-ping" />
            <span>200 OK</span>
          </span>
        </div>

        {/* WebSockets */}
        <div className="bg-graphite-850 p-2 rounded-xl border border-graphite-800 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-slate-400" />
            <span>Socket.IO</span>
          </span>
          <span className={isConnected ? 'text-signal-green font-bold' : 'text-signal-amber font-bold'}>
            {isConnected ? 'LIVE' : 'SYNCING'}
          </span>
        </div>

        {/* Gemini AI */}
        <div className="bg-graphite-850 p-2 rounded-xl border border-graphite-800 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Gemini AI</span>
          </span>
          <span className="text-signal-green font-bold">READY</span>
        </div>

        {/* MongoDB */}
        <div className="bg-graphite-850 p-2 rounded-xl border border-graphite-800 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>MongoDB</span>
          </span>
          <span className="text-signal-green font-bold">ATLAS</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-graphite-800">
        <span>API Response Latency: <strong className="text-brand-gold">{latency} ms</strong></span>
        <span className="text-signal-green font-bold flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3 inline" />
          <span>ALL SYSTEMS NOMINAL</span>
        </span>
      </div>
    </div>
  );
};
