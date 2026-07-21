import React from 'react';
import { Cpu, AlertTriangle, ShieldCheck, AlertOctagon } from 'lucide-react';
import { ChatMessageResult } from '../../types';

interface ExplainabilityDashboardProps {
  result: ChatMessageResult;
}

export const ExplainabilityDashboard: React.FC<ExplainabilityDashboardProps> = ({ result }) => {
  const isScam = result.prediction === 'Scam';

  const metrics = [
    {
      label: 'Urgency Score',
      value: result.triggeredSignals.some((s) => s.toLowerCase().includes('urgency') || s.toLowerCase().includes('immediate')) ? 90 : 15,
      color: 'text-signal-red font-bold',
      barBg: 'bg-signal-red',
    },
    {
      label: 'Authority Impersonation',
      value: result.triggeredSignals.some((s) => s.toLowerCase().includes('authority') || s.toLowerCase().includes('sbi') || s.toLowerCase().includes('police')) ? 85 : 10,
      color: 'text-brand-gold font-bold',
      barBg: 'bg-brand-gold',
    },
    {
      label: 'Payment Request',
      value: result.triggeredSignals.some((s) => s.toLowerCase().includes('payment') || s.toLowerCase().includes('pay') || s.toLowerCase().includes('upi')) ? 95 : 5,
      color: 'text-signal-amber font-bold',
      barBg: 'bg-signal-amber',
    },
    {
      label: 'OTP Request',
      value: result.triggeredSignals.some((s) => s.toLowerCase().includes('otp') || s.toLowerCase().includes('credential')) ? 100 : 0,
      color: 'text-signal-red font-bold',
      barBg: 'bg-signal-red',
    },
    {
      label: 'Suspicious Link Risk',
      value: result.triggeredSignals.some((s) => s.toLowerCase().includes('link') || s.toLowerCase().includes('shortened') || s.toLowerCase().includes('url')) ? 80 : 20,
      color: 'text-blue-400 font-bold',
      barBg: 'bg-blue-500',
    },
  ];

  return (
    <div className="bg-graphite-900 border border-graphite-700 p-4 rounded-2xl shadow-xl space-y-4 font-mono text-xs text-slate-200">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between border-b border-graphite-700 pb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-brand-gold" />
          <h4 className="font-serif font-bold text-sm text-slate-100 uppercase tracking-wider">
            EXPLAINABILITY METRICS DASHBOARD
          </h4>
        </div>
        <span className="text-[10px] text-slate-400">Gemini Feature Weight Analysis</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Main Gauge Dial */}
        <div className="bg-graphite-850 p-4 rounded-xl border border-graphite-800 flex flex-col items-center justify-center text-center space-y-2">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-graphite-950 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isScam ? 'text-signal-red stroke-current' : 'text-signal-green stroke-current'}
                strokeDasharray={`${result.confidence}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-100">{result.confidence}%</span>
              <span className="text-[9px] text-slate-400 font-sans">SCAM PROBABILITY</span>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-200">{result.prediction}</div>
        </div>

        {/* Feature Score Gauge Bars */}
        <div className="col-span-2 space-y-2.5 bg-graphite-850 p-4 rounded-xl border border-graphite-800">
          {metrics.map((m, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-medium">{m.label}</span>
                <span className={m.color}>{m.value}%</span>
              </div>
              <div className="w-full bg-graphite-950 h-2 rounded-full overflow-hidden border border-graphite-700">
                <div
                  className={`h-full ${m.barBg} transition-all duration-500 rounded-full`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
