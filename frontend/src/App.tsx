import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { CommandCenter } from './pages/CommandCenter';
import { ReportsPage } from './pages/ReportsPage';
import { CheckerPage } from './pages/CheckerPage';
import { ReportForm } from './components/reports/ReportForm';
import { ToastContainer } from './components/common/ToastContainer';
import { useDashboard } from './hooks/useDashboard';
import { PrefillReportData } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'reports' | 'checker' | 'analytics'>('map');
  const [currentView, setCurrentView] = useState<'overview' | 'hotspots' | 'analytics'>('overview');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [prefillReportData, setPrefillReportData] = useState<PrefillReportData | null>(null);

  const { summary, refresh, isConnected, liveConnections } = useDashboard();

  function handleOpenReportModalWithData(data: PrefillReportData) {
    setPrefillReportData(data);
    setIsReportModalOpen(true);
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-graphite-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Command Center Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'analytics') setCurrentView('analytics');
          else if (tab === 'map') setCurrentView('overview');
        }}
        isConnected={isConnected}
        liveConnections={liveConnections}
        onRefresh={refresh}
      />

      {/* Main Body Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => {
            setCurrentView(view as any);
            if (view === 'analytics') setActiveTab('analytics');
            else setActiveTab('map');
          }}
          onOpenReportModal={() => {
            setPrefillReportData(null);
            setIsReportModalOpen(true);
          }}
        />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'map' && <CommandCenter currentView={currentView} />}
          {activeTab === 'analytics' && <CommandCenter currentView="analytics" />}
          {activeTab === 'reports' && <ReportsPage />}
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

      {/* Real-time Socket.IO & System Toast Container */}
      <ToastContainer />

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
