import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PrefillReportData } from '../../types';

interface DemoRunnerProps {
  isRunning: boolean;
  onExitDemo: () => void;
  onTabChange: (tab: 'map' | 'reports' | 'checker' | 'analytics') => void;
  onOpenReportModalWithData: (data: PrefillReportData) => void;
  onCloseReportModal: () => void;
  onSubmitReport: () => Promise<void>;
  onTriggerDemoBroadcast: () => void;
}

const DEMO_TEXT =
  'URGENT! Your SBI account has been suspended due to pending KYC verification. Pay Rs.500 processing fee immediately or your account will be permanently blocked. Verify now: bit.ly/fake-bank';

export const DemoRunner: React.FC<DemoRunnerProps> = ({
  isRunning,
  onExitDemo,
  onTabChange,
  onOpenReportModalWithData,
  onCloseReportModal,
  onSubmitReport,
  onTriggerDemoBroadcast,
}) => {
  const [currentStepName, setCurrentStepName] = useState('Initializing Hackathon Evaluation Demo...');
  const [isPaused, setIsPaused] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    let isCancelled = false;

    async function runAutomatedWorkflow() {
      // Step 1: Switch to AI Scam Checker
      if (isCancelled) return;
      setCurrentStepName('Step 1/6: Navigating to AI Scam Checker...');
      setProgressPercent(15);
      onTabChange('checker');

      await sleep(1500);

      // Step 2: Auto-type scam message
      if (isCancelled) return;
      setCurrentStepName('Step 2/6: Auto-typing suspicious message...');
      setProgressPercent(30);

      // Simulate typing text into textarea
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = '';
        for (let i = 0; i < DEMO_TEXT.length; i += 3) {
          if (isCancelled) return;
          textarea.value = DEMO_TEXT.slice(0, i + 3);
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          await sleep(25);
        }
        textarea.value = DEMO_TEXT;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }

      await sleep(1000);

      // Step 3: Press Send & analyze
      if (isCancelled) return;
      setCurrentStepName('Step 3/6: Analyzing scam indicators via Gemini AI...');
      setProgressPercent(50);

      const sendBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Send') || b.textContent?.includes('CHECK'),
      );
      if (sendBtn) {
        sendBtn.click();
      }

      await sleep(3500);

      // Step 4: Trigger Report Incident prefill
      if (isCancelled) return;
      setCurrentStepName('Step 4/6: Opening prefilled citizen report modal...');
      setProgressPercent(70);

      onOpenReportModalWithData({
        title: 'Citizen Scam Report: Urgency, OTP Request, Authority Impersonation',
        description: DEMO_TEXT,
        severity: 'Critical',
        district: 'Lucknow',
        state: 'Uttar Pradesh',
        scamPrediction: 'Scam',
        confidence: 94,
      });

      await sleep(2000);

      // Step 5: Automatically Submit Report
      if (isCancelled) return;
      setCurrentStepName('Step 5/6: Transmitting report to MongoDB Atlas...');
      setProgressPercent(85);

      await onSubmitReport();

      await sleep(1500);
      onCloseReportModal();

      // Step 6: Switch to Command Center & Broadcast real-time Socket updates
      if (isCancelled) return;
      setCurrentStepName('Step 6/6: Live updating Geospatial Command Center...');
      setProgressPercent(100);
      onTabChange('map');

      onTriggerDemoBroadcast();

      await sleep(3000);
      setCurrentStepName('✔ Workflow Complete! Citizen report updated national command grid live.');
    }

    void runAutomatedWorkflow();

    return () => {
      isCancelled = true;
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, [isRunning]);

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      stepTimeoutRef.current = setTimeout(resolve, ms);
    });
  }

  if (!isRunning) return null;

  return (
    <div className="fixed top-20 right-6 z-50 bg-graphite-900/95 backdrop-blur-xl border border-brand-purple rounded-2xl shadow-glow-purple/40 p-4 w-96 space-y-3 text-slate-100 animate-in slide-in-from-top-5 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite-700 pb-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-gold animate-spin" />
          <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
            AUTOMATED DEMO MODE
          </h4>
        </div>
        <button onClick={onExitDemo} className="p-1 text-slate-400 hover:text-white rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-graphite-950 h-2 rounded-full overflow-hidden border border-graphite-800">
        <div
          className="h-full bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-gold transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Name */}
      <div className="text-xs font-mono text-slate-300 bg-graphite-850 p-2.5 rounded-xl border border-graphite-700 leading-snug">
        {currentStepName}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1.5 bg-graphite-850 hover:bg-graphite-800 border border-graphite-700 text-slate-300 rounded-xl text-xs font-mono flex items-center space-x-1"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={() => {
              onExitDemo();
              setTimeout(onTriggerDemoBroadcast, 100);
            }}
            className="px-3 py-1.5 bg-graphite-850 hover:bg-graphite-800 border border-graphite-700 text-slate-300 rounded-xl text-xs font-mono flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>

        <button
          onClick={onExitDemo}
          className="px-3 py-1.5 bg-signal-red/20 border border-signal-red/40 text-signal-red hover:bg-signal-red/30 rounded-xl text-xs font-mono font-bold"
        >
          Exit Demo
        </button>
      </div>
    </div>
  );
};
