import React, { useState } from 'react';
import { X, Sun, Moon, Globe, Cpu, Eye, Bell, Play, Info, RotateCcw, Check } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useSettings } from '../../context/SettingsContext';
import { LanguageCode } from '../../locales/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartTour?: () => void;
  onRunDemo?: () => void;
}

const LANGUAGES: Array<{ code: LanguageCode; name: string; native: string }> = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRestartTour,
  onRunDemo,
}) => {
  const { language, setLanguage, t } = useI18n();
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'appearance' | 'language' | 'ai' | 'accessibility' | 'notifications' | 'demo' | 'about'>('appearance');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-graphite-900 border border-graphite-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 border-b border-graphite-700 bg-graphite-850 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-serif font-bold text-lg text-slate-100">{t('settings')}</h3>
            <span className="text-xs font-mono text-slate-400">| System Preferences</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Drawer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Tab Bar */}
          <div className="w-52 bg-graphite-950 border-r border-graphite-700 p-3 space-y-1 shrink-0 font-mono text-xs">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                activeTab === 'appearance' ? 'bg-brand-indigo text-white font-bold' : 'text-slate-400 hover:bg-graphite-850'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('language')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                activeTab === 'language' ? 'bg-brand-indigo text-white font-bold' : 'text-slate-400 hover:bg-graphite-850'
              }`}
            >
              <Globe className="w-4 h-4 text-brand-gold" />
              <span>Language (i18n)</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                activeTab === 'ai' ? 'bg-brand-indigo text-white font-bold' : 'text-slate-400 hover:bg-graphite-850'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('accessibility')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                activeTab === 'accessibility' ? 'bg-brand-indigo text-white font-bold' : 'text-slate-400 hover:bg-graphite-850'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Accessibility</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                activeTab === 'notifications' ? 'bg-brand-indigo text-white font-bold' : 'text-slate-400 hover:bg-graphite-850'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('demo')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                activeTab === 'demo' ? 'bg-brand-indigo text-white font-bold' : 'text-slate-400 hover:bg-graphite-850'
              }`}
            >
              <Play className="w-4 h-4 text-brand-gold" />
              <span>Demo Controls</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-all ${
                activeTab === 'about' ? 'bg-brand-indigo text-white font-bold' : 'text-slate-400 hover:bg-graphite-850'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About Platform</span>
            </button>
          </div>

          {/* Right Setting Controls Panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-graphite-900 font-sans text-xs">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-slate-100">Theme Mode</h4>
                <div className="grid grid-cols-3 gap-3 font-mono">
                  <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`p-4 rounded-xl border flex flex-col items-center space-y-2 transition-all ${
                      settings.theme === 'dark' ? 'bg-brand-indigo/30 border-brand-purple text-white shadow-glow-purple' : 'bg-graphite-850 border-graphite-700 text-slate-400'
                    }`}
                  >
                    <Moon className="w-6 h-6" />
                    <span>Dark Cyber Security</span>
                  </button>

                  <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`p-4 rounded-xl border flex flex-col items-center space-y-2 transition-all ${
                      settings.theme === 'light' ? 'bg-brand-indigo/30 border-brand-purple text-white shadow-glow-purple' : 'bg-graphite-850 border-graphite-700 text-slate-400'
                    }`}
                  >
                    <Sun className="w-6 h-6" />
                    <span>Light High Contrast</span>
                  </button>

                  <button
                    onClick={() => updateSettings({ theme: 'system' })}
                    className={`p-4 rounded-xl border flex flex-col items-center space-y-2 transition-all ${
                      settings.theme === 'system' ? 'bg-brand-indigo/30 border-brand-purple text-white shadow-glow-purple' : 'bg-graphite-850 border-graphite-700 text-slate-400'
                    }`}
                  >
                    <Cpu className="w-6 h-6" />
                    <span>System Default</span>
                  </button>
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === 'language' && (
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-slate-100">Select Interface Language</h4>
                <p className="text-xs text-slate-400">
                  Instantly updates all UI elements, welcome messages, placeholders, labels, and tooltips without refreshing the page.
                </p>
                <div className="grid grid-cols-2 gap-2.5 font-mono">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                        language === lang.code
                          ? 'bg-brand-indigo border-brand-purple text-white shadow-md'
                          : 'bg-graphite-850 border-graphite-700 text-slate-300 hover:bg-graphite-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{lang.name}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{lang.native}</div>
                      </div>
                      {language === lang.code && <Check className="w-4 h-4 text-brand-gold" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Engine Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-4 font-mono">
                <h4 className="font-serif font-bold text-base text-slate-100 font-sans">AI Reasoning Engine Settings</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-graphite-850 border border-graphite-700 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Show Confidence Score</div>
                      <div className="text-[11px] text-slate-400 font-sans">Display exact AI percentage score</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showConfidenceScore}
                      onChange={(e) => updateSettings({ showConfidenceScore: e.target.checked })}
                      className="w-4 h-4 accent-brand-purple"
                    />
                  </div>

                  <div className="p-3 bg-graphite-850 border border-graphite-700 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Show Explainability Panel</div>
                      <div className="text-[11px] text-slate-400 font-sans">Display feature weight breakdown in cards</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showExplainabilityPanel}
                      onChange={(e) => updateSettings({ showExplainabilityPanel: e.target.checked })}
                      className="w-4 h-4 accent-brand-purple"
                    />
                  </div>

                  <div className="p-3 bg-graphite-850 border border-graphite-700 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Auto Report Suggestion</div>
                      <div className="text-[11px] text-slate-400 font-sans">Show report callout when scam is detected</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoReportSuggestion}
                      onChange={(e) => updateSettings({ autoReportSuggestion: e.target.checked })}
                      className="w-4 h-4 accent-brand-purple"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div className="space-y-4 font-mono">
                <h4 className="font-serif font-bold text-base text-slate-100 font-sans">Accessibility Controls</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-graphite-850 border border-graphite-700 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Font Size</div>
                      <div className="text-[11px] text-slate-400 font-sans">Adjust text sizing</div>
                    </div>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => updateSettings({ fontSize: e.target.value as any })}
                      className="bg-graphite-950 border border-graphite-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className="p-3 bg-graphite-850 border border-graphite-700 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">High Contrast Mode</div>
                      <div className="text-[11px] text-slate-400 font-sans">Sharpen colors & borders</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.highContrast}
                      onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                      className="w-4 h-4 accent-brand-purple"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 font-mono">
                <h4 className="font-serif font-bold text-base text-slate-100 font-sans">Live Alert Settings</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-graphite-850 border border-graphite-700 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Live Incident Toast Alerts</div>
                      <div className="text-[11px] text-slate-400 font-sans">Display floating toasts for incoming reports</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.liveIncidentNotifications}
                      onChange={(e) => updateSettings({ liveIncidentNotifications: e.target.checked })}
                      className="w-4 h-4 accent-brand-purple"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Demo Controls Tab */}
            {activeTab === 'demo' && (
              <div className="space-y-4 font-mono">
                <h4 className="font-serif font-bold text-base text-slate-100 font-sans">Demo & Tour Controls</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onClose();
                      if (onRestartTour) onRestartTour();
                    }}
                    className="w-full p-3 bg-graphite-850 border border-graphite-700 hover:bg-graphite-800 rounded-xl text-left font-bold flex items-center justify-between"
                  >
                    <span>Restart Guided Tour</span>
                    <RotateCcw className="w-4 h-4 text-brand-gold" />
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onRunDemo) onRunDemo();
                    }}
                    className="w-full p-3 bg-brand-indigo hover:bg-brand-purple text-white rounded-xl text-left font-bold flex items-center justify-between"
                  >
                    <span>Run Automated Demo</span>
                    <Play className="w-4 h-4 fill-white" />
                  </button>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-4 font-mono">
                <h4 className="font-serif font-bold text-base text-slate-100 font-sans">About Citizen Fraud Shield</h4>
                <div className="p-4 bg-graphite-850 border border-graphite-700 rounded-xl space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400">Version: </span>
                    <strong className="text-brand-gold">v3.0.0 (Production Release)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Tech Stack: </span>
                    <span className="text-slate-200">React + Node.js + Express + TypeScript + MongoDB Atlas + Socket.IO + Leaflet + Gemini AI</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Architecture: </span>
                    <span className="text-slate-200">2-Stage Explainable AI Fraud Extractor & Geospatial Command Grid</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-graphite-700 bg-graphite-850 flex justify-between items-center font-mono text-xs">
          <button onClick={resetSettings} className="text-slate-400 hover:text-white">
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="bg-brand-indigo hover:bg-brand-purple text-white px-5 py-2 rounded-xl font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
