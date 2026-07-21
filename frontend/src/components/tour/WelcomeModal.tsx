import React from 'react';
import { Shield, Play, X, EyeOff } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onStartTour: () => void;
  onSkip: () => void;
  onDontShowAgain: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onStartTour,
  onSkip,
  onDontShowAgain,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-graphite-900 border border-brand-purple/50 w-full max-w-lg rounded-2xl shadow-glow-purple/30 overflow-hidden flex flex-col p-6 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 border border-brand-purple/50 text-brand-gold flex items-center justify-center shadow-glow-purple">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-slate-100">
              Welcome to Citizen Fraud Shield
            </h2>
            <p className="text-xs font-mono text-slate-400">
              National Cyber Fraud Detection & Response Grid
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 text-xs font-sans text-slate-300 leading-relaxed bg-graphite-850 p-4 rounded-xl border border-graphite-700">
          <p>
            Citizen Fraud Shield is an AI-powered cybersecurity platform that empowers citizens to verify suspicious SMS, WhatsApp, and phishing messages while providing law enforcement with real-time geospatial intelligence on emerging fraud hotspots.
          </p>
          <p className="text-brand-gold font-mono font-semibold">
            ⏱️ Take a quick 90-second guided tour or launch a one-click automated demo for hackathon evaluation.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onDontShowAgain}
            className="text-xs font-mono text-slate-500 hover:text-slate-300 flex items-center space-x-1"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Don't show again</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              Skip
            </button>
            <button
              onClick={onStartTour}
              className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-purple hover:to-brand-indigo text-white font-mono text-xs font-bold py-2.5 px-5 rounded-xl shadow-glow-purple flex items-center space-x-2 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Guided Tour</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
