import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';
import { ChatMessageResult } from '../../types';

interface ExplainabilityPanelProps {
  result: ChatMessageResult;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const indicators = [
    {
      name: 'Urgency Language',
      detected: result.triggeredSignals.some((s) => s.toLowerCase().includes('urgency') || s.toLowerCase().includes('immediate')),
      description: 'Coercive phrases demanding rapid action (e.g. "immediately", "within 24h").',
    },
    {
      name: 'Authority Impersonation',
      detected: result.triggeredSignals.some((s) => s.toLowerCase().includes('authority') || s.toLowerCase().includes('sbi') || s.toLowerCase().includes('police')),
      description: 'Claims to represent SBI, RBI, Police, Income Tax, or Customs.',
    },
    {
      name: 'Payment Request',
      detected: result.triggeredSignals.some((s) => s.toLowerCase().includes('payment') || s.toLowerCase().includes('pay') || s.toLowerCase().includes('upi')),
      description: 'Demands financial transfer via UPI, gift card, or net banking.',
    },
    {
      name: 'Suspicious Link / URL',
      detected: result.triggeredSignals.some((s) => s.toLowerCase().includes('link') || s.toLowerCase().includes('shortened') || s.toLowerCase().includes('url')),
      description: 'Contains shortened domain (bit.ly, tinyurl) or suspicious link.',
    },
    {
      name: 'OTP Request',
      detected: result.triggeredSignals.some((s) => s.toLowerCase().includes('otp') || s.toLowerCase().includes('credential')),
      description: 'Solicits One-Time Passwords or credential verification.',
    },
  ];

  return (
    <div className="bg-graphite-850 border border-graphite-700 rounded-xl overflow-hidden text-xs">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-left font-mono font-bold text-slate-300 hover:bg-graphite-800 transition-colors"
      >
        <span className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-brand-gold" />
          <span>Why was this flagged? (Explainability Breakdown)</span>
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-graphite-700 space-y-4 animate-in fade-in duration-150">
          {/* Confidence Weight Progress Bar */}
          <div>
            <div className="flex justify-between font-mono text-[11px] text-slate-400 mb-1">
              <span>CONFIDENCE WEIGHT BREAKDOWN</span>
              <span className="text-brand-gold font-bold">{result.confidence}%</span>
            </div>
            <div className="w-full bg-graphite-950 h-2 rounded-full overflow-hidden border border-graphite-700">
              <div
                className="h-full bg-gradient-to-r from-brand-indigo to-signal-red rounded-full"
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          {/* Indicators Checkbox Breakdown */}
          <div className="space-y-2 font-mono">
            {indicators.map((ind, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-start space-x-2.5 ${
                  ind.detected
                    ? 'bg-signal-red/10 border-signal-red/30 text-slate-100'
                    : 'bg-graphite-900 border-graphite-700 text-slate-500 opacity-60'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                    ind.detected ? 'bg-signal-red text-white' : 'bg-graphite-800 border border-graphite-700'
                  }`}
                >
                  {ind.detected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                <div>
                  <div className="font-bold flex items-center space-x-2">
                    <span>{ind.name}</span>
                    {ind.detected && <span className="text-[10px] text-signal-red uppercase font-bold">[TRIGGERED]</span>}
                  </div>
                  <div className="text-[11px] font-sans text-slate-400 mt-0.5">{ind.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
