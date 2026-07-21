import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle2, Shield } from 'lucide-react';

export interface TourStep {
  stepNumber: number;
  title: string;
  description: string;
  targetSelector?: string;
  tabRequirement?: 'map' | 'reports' | 'checker' | 'analytics';
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    title: 'Platform Navigation & Mission',
    description:
      'Welcome to Citizen Fraud Shield. This platform connects citizen-facing AI scam detection with a national law enforcement geospatial intelligence command center.',
    tabRequirement: 'map',
  },
  {
    stepNumber: 2,
    title: 'AI Scam Checker',
    description:
      'Citizens paste suspicious SMS, WhatsApp, Email, or UPI payment links here. Our AI analyzes them using explainable fraud indicators.',
    tabRequirement: 'checker',
  },
  {
    stepNumber: 3,
    title: 'Message Analysis Input',
    description:
      'Enter any suspicious message text. The two-stage AI engine extracts structured indicators (urgency, impersonation, payment links, OTP requests) before reasoning over verdict.',
    tabRequirement: 'checker',
  },
  {
    stepNumber: 4,
    title: 'Explainable AI Verdict Card',
    description:
      'Every prediction provides a Confidence Score, Risk Level, Triggered Red Flags, Explainable AI Reasoning, and Tactical Recommended Safety Actions.',
    tabRequirement: 'checker',
  },
  {
    stepNumber: 5,
    title: 'Citizen Fraud Reporting Integration',
    description:
      'If a scam is detected, citizens can submit a verified incident report prefilled directly from the AI analysis to update the national database.',
    tabRequirement: 'checker',
  },
  {
    stepNumber: 6,
    title: 'Geospatial Command Center Map',
    description:
      'Every submitted report updates this live interactive Leaflet dashboard. Hotspots are calculated using fraud density, severity, and recency scoring algorithms.',
    tabRequirement: 'map',
  },
  {
    stepNumber: 7,
    title: 'Real-Time Incident Stream (Socket.IO)',
    description:
      'Using Socket.IO WebSockets, incoming citizen reports stream live to the Command Center in real time without requiring page refreshes.',
    tabRequirement: 'map',
  },
  {
    stepNumber: 8,
    title: 'Dashboard Summary & Enforcement KPIs',
    description:
      'The Command Center aggregates total incidents, critical clusters, verified reports, and Gemini AI law enforcement recommendations to prioritize responses.',
    tabRequirement: 'map',
  },
];

interface GuidedTourProps {
  isActive: boolean;
  onFinish: () => void;
  onSkip: () => void;
  onTabChange: (tab: 'map' | 'reports' | 'checker' | 'analytics') => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isActive,
  onFinish,
  onSkip,
  onTabChange,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TOUR_STEPS[currentStepIndex];

  useEffect(() => {
    if (isActive && step && step.tabRequirement) {
      onTabChange(step.tabRequirement);
    }
  }, [isActive, currentStepIndex, step, onTabChange]);

  if (!isActive || !step) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  function handleNext() {
    if (isLastStep) {
      onFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* Darkened Spotlight Background Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto" />

      {/* Floating Tour Step Card */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-graphite-900 border border-brand-purple rounded-2xl shadow-glow-purple/40 p-6 space-y-4 text-slate-100 pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-200">
        {/* Step Header & Progress */}
        <div className="flex items-center justify-between border-b border-graphite-700 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-brand-purple/20 border border-brand-purple/40 text-brand-gold font-mono font-bold text-xs flex items-center justify-center">
              {step.stepNumber}
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-100">{step.title}</h3>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-400">
              Step <strong className="text-brand-gold">{step.stepNumber}</strong> of {TOUR_STEPS.length}
            </span>
            <button
              onClick={onSkip}
              className="text-slate-500 hover:text-slate-300 p-1"
              title="Skip Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Description */}
        <p className="text-xs text-slate-200 font-sans leading-relaxed bg-graphite-850 p-4 rounded-xl border border-graphite-700">
          {step.description}
        </p>

        {/* Tour Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onSkip}
            className="text-xs font-mono text-slate-500 hover:text-slate-300"
          >
            Skip Tour
          </button>

          <div className="flex items-center space-x-2">
            <button
              disabled={isFirstStep}
              onClick={handlePrev}
              className="px-3 py-1.5 bg-graphite-850 border border-graphite-700 rounded-xl text-xs font-mono text-slate-300 hover:bg-graphite-800 disabled:opacity-40 flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-1.5 bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-purple hover:to-brand-indigo text-white rounded-xl text-xs font-mono font-bold shadow-glow-purple flex items-center space-x-1.5 transition-all"
            >
              <span>{isLastStep ? 'Start Using Platform' : 'Next'}</span>
              {isLastStep ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
