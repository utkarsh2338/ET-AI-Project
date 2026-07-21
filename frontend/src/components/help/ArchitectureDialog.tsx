import React from 'react';
import { X, Cpu, Database, Network, Shield, ArrowRight, Activity, Server, Radio } from 'lucide-react';

interface ArchitectureDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDialog: React.FC<ArchitectureDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-graphite-900 border border-brand-purple/60 w-full max-w-4xl rounded-2xl shadow-glow-purple/40 overflow-hidden flex flex-col p-6 space-y-6 text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-graphite-700 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/40 text-brand-gold flex items-center justify-center">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-2xl text-slate-100">
                System Architecture & Tech Stack
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Modular 2-Stage AI Engine, MongoDB Atlas, Socket.IO WebSockets & Leaflet GIS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-graphite-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Architecture Flow Diagram */}
        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Row 1: Frontend & API Layer */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-graphite-850 border border-graphite-700 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-brand-gold font-mono font-bold text-xs">
                <span>REACT FRONTEND</span>
                <span className="text-[10px] text-slate-500">Vite + Tailwind</span>
              </div>
              <p className="text-xs text-slate-300">
                WhatsApp-style Citizen Chat UI + Command Center Geospatial Dashboard.
              </p>
            </div>

            <div className="flex items-center justify-center text-brand-gold">
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </div>

            <div className="bg-graphite-850 border border-graphite-700 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-brand-gold font-mono font-bold text-xs">
                <span>EXPRESS REST API</span>
                <span className="text-[10px] text-slate-500">Node.js + TS</span>
              </div>
              <p className="text-xs text-slate-300">
                Modular controller routes (`/predict`, `/reports`, `/dashboard`, `/translate`).
              </p>
            </div>
          </div>

          {/* Row 2: 2-Stage AI Pipeline */}
          <div className="bg-graphite-850 border border-brand-purple/40 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-brand-gold">
              <span className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-brand-gold" />
                <span>TWO-STAGE EXPLAINABLE AI PREDICTION PIPELINE</span>
              </span>
              <span className="text-[10px] text-slate-400">Gemini 1.5 Flash</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-graphite-900 p-3 rounded-lg border border-graphite-700 space-y-1">
                <div className="font-mono text-xs font-bold text-slate-200">Stage 1: Deterministic Feature Extractor</div>
                <p className="text-[11px] text-slate-400">
                  Extracts urgency scores, authority impersonation, payment links, shortened URLs, threat scores, and OTP requests.
                </p>
              </div>

              <div className="bg-graphite-900 p-3 rounded-lg border border-graphite-700 space-y-1">
                <div className="font-mono text-xs font-bold text-slate-200">Stage 2: Gemini Explainable Reasoning</div>
                <p className="text-[11px] text-slate-400">
                  Generates transparent verdicts, confidence percentages, red flag indicators, and tactical safety steps.
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Database & Geospatial Engine */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-graphite-850 border border-graphite-700 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-brand-gold font-mono font-bold text-xs">
                <span className="flex items-center space-x-1">
                  <Database className="w-4 h-4 text-brand-gold" />
                  <span>MONGODB ATLAS</span>
                </span>
                <span className="text-[10px] text-slate-500">SHA-256 Dedup</span>
              </div>
              <p className="text-xs text-slate-300">
                `Report` & `DistrictStats` collections with compound geospatial indexing.
              </p>
            </div>

            <div className="bg-graphite-850 border border-graphite-700 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-brand-gold font-mono font-bold text-xs">
                <span className="flex items-center space-x-1">
                  <Activity className="w-4 h-4 text-brand-gold" />
                  <span>HOTSPOT ENGINE</span>
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Formula: Density × 0.5 + Severity × 0.3 + Recency × 0.2.
              </p>
            </div>

            <div className="bg-graphite-850 border border-graphite-700 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-brand-gold font-mono font-bold text-xs">
                <span className="flex items-center space-x-1">
                  <Radio className="w-4 h-4 text-signal-green" />
                  <span>SOCKET.IO STREAM</span>
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pushes `NEW_REPORT` & `HOTSPOT_UPDATE` events live to connected clients.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-graphite-700">
          <button
            onClick={onClose}
            className="bg-brand-indigo hover:bg-brand-purple text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold transition-colors"
          >
            Close Architecture Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
