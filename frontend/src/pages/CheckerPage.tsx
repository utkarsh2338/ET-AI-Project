import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, Sparkles, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { analyzeScamText } from '../lib/api';

export const CheckerPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    prediction: string;
    confidence: number;
    risk: string;
    explanation: string;
    triggeredSignals: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await analyzeScamText(message);
      setResult(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 bg-graphite-950 overflow-y-auto p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 text-brand-gold flex items-center justify-center mx-auto shadow-glow-purple">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="font-serif font-bold text-3xl text-slate-100">AI Scam Message Analyzer</h2>
          <p className="text-sm text-slate-400 font-sans max-w-xl mx-auto">
            Paste any suspicious SMS, WhatsApp message, email, or UPI request below. Our two-stage AI engine will extract fraud indicators and generate an explainable verdict.
          </p>
        </div>

        {/* Input Box */}
        <form onSubmit={handleCheck} className="bg-graphite-900 border border-graphite-700 rounded-2xl p-4 shadow-2xl space-y-4">
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: URGENT! Your SBI account is BLOCKED due to pending KYC. Pay Rs.500 processing fee via UPI to bit.ly/unblock-sbi now or your account will be permanently frozen!"
            className="w-full bg-graphite-950 border border-graphite-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-brand-purple"
          />

          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-slate-500">
              🔒 Privacy Protected: No personal identifiable info stored.
            </div>

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-purple hover:to-brand-indigo text-white font-mono text-xs font-bold py-2.5 px-6 rounded-xl shadow-glow-purple flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Analyzing Signals...' : 'CHECK MESSAGE'}</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-signal-red/20 border border-signal-red/50 text-signal-red p-4 rounded-xl text-xs font-mono">
            {error}
          </div>
        )}

        {/* Results Card matching UI Mockup */}
        {result && (
          <div className="bg-graphite-900 border border-graphite-700 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-300">
            {/* Verdict Header */}
            <div className="flex items-center justify-between border-b border-graphite-700 pb-4">
              <div className="flex items-center space-x-3">
                {result.prediction === 'Scam' ? (
                  <div className="w-10 h-10 rounded-xl bg-signal-red/20 border border-signal-red text-signal-red flex items-center justify-center">
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-signal-green/20 border border-signal-green text-signal-green flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <h3 className="font-serif font-bold text-2xl text-slate-100">
                    {result.prediction === 'Scam' ? 'Verified Fraud Attempt' : 'Legitimate Communication'}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Confidence: <strong className="text-brand-gold">{result.confidence}%</strong> | Risk Level: <strong className={result.prediction === 'Scam' ? 'text-signal-red' : 'text-signal-green'}>{result.risk}</strong>
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${result.prediction === 'Scam' ? 'bg-signal-red/20 text-signal-red border-signal-red/40' : 'bg-signal-green/20 text-signal-green border-signal-green/40'}`}>
                {result.prediction.toUpperCase()}
              </span>
            </div>

            {/* Explanation */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                EXPLAINABLE AI REASONING
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed font-sans bg-graphite-850 p-4 rounded-xl border border-graphite-700">
                {result.explanation}
              </p>
            </div>

            {/* Triggered Signals */}
            {result.triggeredSignals.length > 0 && (
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  TRIGGERED SCAM RED FLAGS
                </h4>
                <div className="space-y-1.5">
                  {result.triggeredSignals.map((sig, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs font-mono text-signal-red bg-signal-red/10 border border-signal-red/30 p-2.5 rounded-lg">
                      <AlertOctagon className="w-4 h-4 shrink-0" />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
