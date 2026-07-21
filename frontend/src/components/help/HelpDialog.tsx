import React, { useState } from 'react';
import { HelpCircle, X, ArrowRight, ShieldCheck, Cpu, Database, MapPin, Radio, Activity, UserCheck } from 'lucide-react';

export const HelpDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-6 z-40 bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-purple hover:to-brand-indigo text-white p-3 rounded-full shadow-glow-purple flex items-center space-x-2 transition-all hover:scale-105 border border-brand-purple/50"
        title="How Citizen Fraud Shield Works"
      >
        <HelpCircle className="w-5 h-5 text-brand-gold" />
        <span className="text-xs font-mono font-bold hidden sm:inline">How It Works</span>
      </button>

      {/* Visual Pipeline Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-graphite-900 border border-graphite-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-6 text-slate-100 max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-graphite-700 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/40 text-brand-gold flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-100">
                    How Citizen Fraud Shield Works
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    End-to-End Cyber Crime Detection & Law Enforcement Response Pipeline
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-graphite-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Pipeline Flow */}
            <div className="space-y-4 overflow-y-auto pr-2">
              <div className="grid grid-cols-4 gap-3 text-center">
                {/* Stage 1 */}
                <div className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-indigo/30 border border-brand-purple/40 text-brand-gold mx-auto flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-100">1. Citizen Input</div>
                  <p className="text-[10px] text-slate-400">Pastes SMS, WhatsApp, or payment link</p>
                </div>

                {/* Stage 2 */}
                <div className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-indigo/30 border border-brand-purple/40 text-brand-gold mx-auto flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-100">2. AI Extraction</div>
                  <p className="text-[10px] text-slate-400">Extracts urgency, OTP, links, impersonation</p>
                </div>

                {/* Stage 3 */}
                <div className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-indigo/30 border border-brand-purple/40 text-brand-gold mx-auto flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-100">3. Explainable Verdict</div>
                  <p className="text-[10px] text-slate-400">Gemini generates confidence & actions</p>
                </div>

                {/* Stage 4 */}
                <div className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-indigo/30 border border-brand-purple/40 text-brand-gold mx-auto flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-100">4. Report Database</div>
                  <p className="text-[10px] text-slate-400">SHA-256 deduplicated MongoDB Atlas</p>
                </div>
              </div>

              {/* Connecting Flow Arrow */}
              <div className="flex items-center justify-center text-brand-gold font-mono text-xs space-x-2 py-1">
                <span>RECALCULATE HOTSPOTS & BROADCAST WEBSOCKETS</span>
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {/* Stage 5 */}
                <div className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-indigo/30 border border-brand-purple/40 text-brand-gold mx-auto flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-100">5. Hotspot Scoring Engine</div>
                  <p className="text-[10px] text-slate-400">Density × 0.5 + Severity × 0.3 + Recency × 0.2</p>
                </div>

                {/* Stage 6 */}
                <div className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-indigo/30 border border-brand-purple/40 text-brand-gold mx-auto flex items-center justify-center">
                    <Radio className="w-4 h-4 text-signal-green" />
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-100">6. Socket.IO Live Stream</div>
                  <p className="text-[10px] text-slate-400">Real-time alerts to command dashboards</p>
                </div>

                {/* Stage 7 */}
                <div className="bg-graphite-850 border border-graphite-700 p-3 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-indigo/30 border border-brand-purple/40 text-brand-gold mx-auto flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-100">7. Police Recommendation</div>
                  <p className="text-[10px] text-slate-400">Gemini advises targeted police action</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-graphite-700">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-brand-indigo hover:bg-brand-purple text-white px-5 py-2 rounded-xl text-xs font-mono font-bold transition-colors"
              >
                Close Pipeline Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
