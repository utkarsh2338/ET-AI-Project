import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { CommandCenter } from './pages/CommandCenter';
import { ReportsPage } from './pages/ReportsPage';
import { CheckerPage } from './pages/CheckerPage';
import { ReportForm } from './components/reports/ReportForm';
import { useDashboard } from './hooks/useDashboard';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'reports' | 'checker' | 'analytics'>('map');
  const [currentView, setCurrentView] = useState<'overview' | 'hotspots' | 'analytics'>('overview');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { summary, refresh, isConnected, liveConnections } = useDashboard();

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
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'map' && <CommandCenter currentView={currentView} />}
          {activeTab === 'analytics' && <CommandCenter currentView="analytics" />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'checker' && <CheckerPage />}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        activeDistricts={summary?.activeDistricts ?? 50}
        totalReports={summary?.totalReports ?? 262}
      />

      {/* Citizen Report Form Modal */}
      <ReportForm
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
};
export default App;
