import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { CommandCenter } from './pages/CommandCenter';
import { ReportsPage } from './pages/ReportsPage';
import { CheckerPage } from './pages/CheckerPage';
import { ReportForm } from './components/reports/ReportForm';
import { ToastContainer } from './components/common/ToastContainer';
import { WelcomeModal } from './components/tour/WelcomeModal';
import { GuidedTour } from './components/tour/GuidedTour';
import { DemoRunner } from './components/tour/DemoRunner';
import { HelpDialog } from './components/help/HelpDialog';
import { ArchitectureDialog } from './components/help/ArchitectureDialog';
import { useDashboard } from './hooks/useDashboard';
import { submitReport } from './lib/api';
import { showToast } from './hooks/useToast';
import { PrefillReportData } from './types';

import { SettingsModal } from './components/settings/SettingsModal';
import { CommandPalette } from './components/common/CommandPalette';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { NationalThreatBanner } from './components/dashboard/NationalThreatBanner';
import { TimelinePage } from './pages/TimelinePage';

const TOUR_STORAGE_KEY = 'cfs_tour_status';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'reports' | 'checker' | 'analytics' | 'timeline'>('map');
  const [currentView, setCurrentView] = useState<'overview' | 'hotspots' | 'analytics'>('overview');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [prefillReportData, setPrefillReportData] = useState<PrefillReportData | null>(null);

  // Tour, Demo & Settings state
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isGuidedTourActive, setIsGuidedTourActive] = useState(false);
  const [isDemoModeRunning, setIsDemoModeRunning] = useState(false);
  const [isArchitectureDialogOpen, setIsArchitectureDialogOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const { summary, markers, refresh, isConnected, liveConnections } = useDashboard();

  // Global Keyboard Shortcuts (Ctrl + K, Ctrl + /, Esc)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsShortcutsModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsArchitectureDialogOpen(false);
        setIsReportModalOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check onboarding status on initial launch
  useEffect(() => {
    try {
      const status = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!status) {
        setIsWelcomeModalOpen(true);
      }
    } catch (e) {
      setIsWelcomeModalOpen(true);
    }
  }, []);

  function handleOpenReportModalWithData(data: PrefillReportData) {
    setPrefillReportData(data);
    setIsReportModalOpen(true);
  }

  async function handleDemoSubmitReport() {
    try {
      await submitReport({
        title: 'Citizen Scam Report: Urgency, OTP Request, Authority Impersonation',
        description:
          'URGENT! Your SBI account has been suspended due to pending KYC verification. Pay Rs.500 processing fee immediately or your account will be permanently blocked. Verify now: bit.ly/fake-bank',
        category: 'OTP Scam',
        district: 'Lucknow',
        state: 'Uttar Pradesh',
        latitude: 26.8467,
        longitude: 80.9462,
        severity: 'Critical',
      });
    } catch (e) {
      console.warn('Demo submit silent fallback:', e);
    }
  }

  function handleTriggerDemoBroadcast() {
    showToast({
      type: 'error',
      title: 'New Incident Reported — Lucknow',
      message: 'URGENT! SBI account suspended due to pending KYC... (Critical Severity)',
      district: 'Lucknow',
    });
    refresh();
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-graphite-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Command Center Header */}
      <Navbar
        activeTab={activeTab as any}
        setActiveTab={(tab) => {
          setActiveTab(tab as any);
          if (tab === 'analytics') setCurrentView('analytics');
          else if (tab === 'map') setCurrentView('overview');
        }}
        isConnected={isConnected}
        liveConnections={liveConnections}
        onRefresh={refresh}
        onRunDemo={() => setIsDemoModeRunning(true)}
        onOpenArchitecture={() => setIsArchitectureDialogOpen(true)}
        onStartTour={() => setIsGuidedTourActive(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onNavigateHome={() => {
          setActiveTab('map');
          setCurrentView('overview');
        }}
      />

      {/* National Threat Ticker Banner */}
      <NationalThreatBanner markers={markers} />

      {/* Main Body Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          isConnected={isConnected}
          onSelectView={(view) => {
            if (view === 'timeline') {
              setActiveTab('timeline');
            } else {
              setCurrentView(view as any);
              if (view === 'analytics') setActiveTab('analytics');
              else setActiveTab('map');
            }
          }}
          onOpenReportModal={() => {
            setPrefillReportData(null);
            setIsReportModalOpen(true);
          }}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'map' && <CommandCenter currentView={currentView} />}
          {activeTab === 'analytics' && <CommandCenter currentView="analytics" />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'timeline' && <TimelinePage />}
          {activeTab === 'checker' && (
            <CheckerPage onOpenReportModalWithData={handleOpenReportModalWithData} />
          )}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        activeDistricts={summary?.activeDistricts ?? 50}
        totalReports={summary?.totalReports ?? 262}
      />

      {/* Floating Help Button */}
      <HelpDialog />

      {/* Real-time Socket.IO & System Toast Container */}
      <ToastContainer />

      {/* System Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onRestartTour={() => setIsGuidedTourActive(true)}
        onRunDemo={() => setIsDemoModeRunning(true)}
      />

      {/* Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          if (tab === 'analytics') setCurrentView('analytics');
          else if (tab === 'map') setCurrentView('overview');
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onRunDemo={() => setIsDemoModeRunning(true)}
        onStartTour={() => setIsGuidedTourActive(true)}
        onOpenArchitecture={() => setIsArchitectureDialogOpen(true)}
      />

      {/* Keyboard Shortcuts Reference Modal (Ctrl + /) */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Welcome Onboarding Modal */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onStartTour={() => {
          setIsWelcomeModalOpen(false);
          setIsGuidedTourActive(true);
        }}
        onSkip={() => setIsWelcomeModalOpen(false)}
        onDontShowAgain={() => {
          setIsWelcomeModalOpen(false);
          try {
            localStorage.setItem(TOUR_STORAGE_KEY, 'completed');
          } catch (e) {}
        }}
      />

      {/* Guided Tour Spotlight Overlay */}
      <GuidedTour
        isActive={isGuidedTourActive}
        onTabChange={setActiveTab}
        onSkip={() => setIsGuidedTourActive(false)}
        onFinish={() => {
          setIsGuidedTourActive(false);
          try {
            localStorage.setItem(TOUR_STORAGE_KEY, 'completed');
          } catch (e) {}
        }}
      />

      {/* Automated Demo Mode Runner */}
      <DemoRunner
        isRunning={isDemoModeRunning}
        onExitDemo={() => setIsDemoModeRunning(false)}
        onTabChange={setActiveTab}
        onOpenReportModalWithData={handleOpenReportModalWithData}
        onCloseReportModal={() => setIsReportModalOpen(false)}
        onSubmitReport={handleDemoSubmitReport}
        onTriggerDemoBroadcast={handleTriggerDemoBroadcast}
      />

      {/* Interactive System Architecture Diagram Modal */}
      <ArchitectureDialog
        isOpen={isArchitectureDialogOpen}
        onClose={() => setIsArchitectureDialogOpen(false)}
      />

      {/* Citizen Report Form Modal */}
      <ReportForm
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setPrefillReportData(null);
        }}
        prefillData={prefillReportData}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
};
export default App;

