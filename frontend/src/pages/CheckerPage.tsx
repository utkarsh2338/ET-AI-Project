import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Send,
  Copy,
  FilePlus,
  Languages,
  RefreshCw,
  Trash2,
  Plus,
  MessageSquare,
  Globe,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { analyzeScamText, translateAnalysis } from '../lib/api';
import { ChatMessage, ChatSession, ChatMessageResult, PrefillReportData } from '../types';
import { showToast } from '../hooks/useToast';

interface CheckerPageProps {
  onOpenReportModalWithData?: (data: PrefillReportData) => void;
}

const STORAGE_KEY = 'cfs_chat_sessions';

function getInitialSessions(): ChatSession[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load chat history:', e);
  }

  const defaultSessionId = `session-${Date.now()}`;
  return [
    {
      id: defaultSessionId,
      title: 'Scam Analysis Session',
      messages: [
        {
          id: `msg-welcome`,
          role: 'assistant',
          text: 'Hello! I am your AI Cyber Fraud Safety Assistant. Paste any suspicious message, SMS, email, or WhatsApp communication below to inspect scam indicators in real-time.',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export const CheckerPage: React.FC<CheckerPageProps> = ({ onOpenReportModalWithData }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(getInitialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'session-1');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'ta'>('en');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Save sessions to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to persist chat sessions:', e);
    }
  }, [sessions]);

  // Active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, loading]);

  function handleCreateNewSession() {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `New Analysis`,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          text: 'Hello! I am your AI Cyber Fraud Safety Assistant. Paste any suspicious message below.',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    showToast({ type: 'info', title: 'New Chat Created', message: 'Started a fresh scam analysis session.' });
  }

  function handleClearCurrentChat() {
    if (!activeSession) return;
    const clearedMessages: ChatMessage[] = [
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        text: 'Chat cleared. How can I help you analyze messages?',
        timestamp: new Date().toISOString(),
      },
    ];

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, messages: clearedMessages, updatedAt: new Date().toISOString() } : s)),
    );
    showToast({ type: 'info', title: 'Chat Cleared', message: 'Current conversation history reset.' });
  }

  async function handleSendMessage(customText?: string) {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || loading) return;

    if (!customText) setInputMessage('');

    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    // Update messages with user message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession?.id) {
          const updatedMessages = [...s.messages, userMsg];
          const newTitle = s.title === 'New Analysis' || s.title === 'Scam Analysis Session'
            ? textToSend.slice(0, 30) + '...'
            : s.title;
          return { ...s, title: newTitle, messages: updatedMessages, updatedAt: new Date().toISOString() };
        }
        return s;
      }),
    );

    setLoading(true);

    try {
      // 1. Call backend prediction API
      const prediction = await analyzeScamText(textToSend);

      // Default recommended actions based on risk
      const defaultActions = prediction.prediction === 'Scam'
        ? [
            'Do not reply, click links, or share any OTPs.',
            'Block and report the phone number or sender ID.',
            'Report this incident to the National Cyber Crime Portal (1930).',
          ]
        : [
            'Message appears consistent with standard communication.',
            'Always verify official bank communications through official apps.',
          ];

      const resultObj: ChatMessageResult = {
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        risk: prediction.risk,
        explanation: prediction.explanation,
        triggeredSignals: prediction.triggeredSignals,
        recommendedActions: defaultActions,
        language: 'en',
      };

      // 2. If non-English selected, perform translation
      let finalResult = resultObj;
      if (selectedLanguage !== 'en') {
        const tr = await translateAnalysis(
          {
            verdict: prediction.prediction === 'Scam' ? 'Scam Detected' : 'Legitimate Communication',
            explanation: prediction.explanation,
            triggered_signals: prediction.triggeredSignals,
            recommended_actions: defaultActions,
          },
          selectedLanguage,
        );

        finalResult = {
          ...resultObj,
          explanation: tr.explanation,
          triggeredSignals: tr.triggered_signals,
          recommendedActions: tr.recommended_actions,
          language: selectedLanguage,
        };
      }

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        text: `Analysis complete. Verdict: ${finalResult.prediction} (${finalResult.confidence}% confidence).`,
        timestamp: new Date().toISOString(),
        result: resultObj,
        translatedResult: selectedLanguage !== 'en' ? finalResult : undefined,
        currentLanguage: selectedLanguage,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession?.id) {
            return { ...s, messages: [...s.messages, assistantMsg], updatedAt: new Date().toISOString() };
          }
          return s;
        }),
      );
    } catch (err) {
      showToast({ type: 'error', title: 'Analysis Failed', message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function handleTranslateMessage(msgId: string, targetLang: 'en' | 'hi' | 'ta') {
    if (!activeSession) return;
    const msg = activeSession.messages.find((m) => m.id === msgId);
    if (!msg || !msg.result) return;

    if (targetLang === 'en') {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.map((m) => (m.id === msgId ? { ...m, currentLanguage: 'en' } : m)),
            };
          }
          return s;
        }),
      );
      return;
    }

    // Set translating loading state
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: s.messages.map((m) => (m.id === msgId ? { ...m, isTranslating: true } : m)),
          };
        }
        return s;
      }),
    );

    try {
      const tr = await translateAnalysis(
        {
          verdict: msg.result.prediction === 'Scam' ? 'Scam Detected' : 'Legitimate Communication',
          explanation: msg.result.explanation,
          triggered_signals: msg.result.triggeredSignals,
          recommended_actions: msg.result.recommendedActions || [],
        },
        targetLang,
      );

      const translatedRes: ChatMessageResult = {
        ...msg.result,
        explanation: tr.explanation,
        triggeredSignals: tr.triggered_signals,
        recommendedActions: tr.recommended_actions,
        language: targetLang,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === msgId
                  ? { ...m, translatedResult: translatedRes, currentLanguage: targetLang, isTranslating: false }
                  : m,
              ),
            };
          }
          return s;
        }),
      );
      showToast({ type: 'success', title: 'Translated', message: `Report translated to ${targetLang === 'hi' ? 'Hindi' : 'Tamil'}` });
    } catch (err) {
      showToast({ type: 'error', title: 'Translation Error', message: (err as Error).message });
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.map((m) => (m.id === msgId ? { ...m, isTranslating: false } : m)),
            };
          }
          return s;
        }),
      );
    }
  }

  function handleReportClick(msgText: string, result?: ChatMessageResult) {
    if (!onOpenReportModalWithData) return;

    const prefillData: PrefillReportData = {
      title: result?.triggeredSignals?.length
        ? `Citizen Scam Report: ${result.triggeredSignals.join(', ')}`
        : `Citizen Scam Report`,
      description: msgText,
      severity: (result?.risk as any) || 'High',
      scamPrediction: result?.prediction || 'Scam',
      confidence: result?.confidence || 90,
    };

    onOpenReportModalWithData(prefillData);
  }

  function handleCopyReport(msgText: string, result?: ChatMessageResult) {
    const summary = `CFS SCAM REPORT SUMMARY:
Verdict: ${result?.prediction || 'Suspicious'}
Confidence: ${result?.confidence || 0}%
Risk Level: ${result?.risk || 'High'}
Message: "${msgText}"
Red Flags: ${result?.triggeredSignals?.join(', ') || 'N/A'}
Explanation: ${result?.explanation || 'N/A'}`;

    navigator.clipboard.writeText(summary);
    showToast({ type: 'success', title: 'Copied to Clipboard', message: 'Report summary copied.' });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  }

  return (
    <div className="flex-1 flex h-full bg-graphite-950 overflow-hidden text-slate-100">
      {/* Left Conversations Drawer / History Sidebar */}
      <div className="w-72 bg-graphite-900 border-r border-graphite-700 flex flex-col shrink-0 select-none">
        <div className="p-4 border-b border-graphite-700 bg-graphite-850 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-brand-gold" />
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
              CHAT HISTORY
            </h3>
          </div>
          <button
            onClick={handleCreateNewSession}
            className="p-1.5 bg-brand-indigo hover:bg-brand-purple text-white rounded-lg transition-colors flex items-center space-x-1 text-xs font-mono"
            title="New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-graphite-800 border-brand-purple text-slate-100 shadow-sm'
                    : 'bg-graphite-850/50 border-graphite-700 text-slate-400 hover:bg-graphite-850 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs truncate">{s.title}</div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>{s.messages.length} messages</span>
                  <span>{new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-graphite-700 bg-graphite-850">
          <button
            onClick={handleClearCurrentChat}
            className="w-full py-2 px-3 bg-graphite-950 hover:bg-signal-red/20 hover:text-signal-red border border-graphite-700 text-slate-400 rounded-xl font-mono text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Current Chat</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-hidden relative">
        {/* Chat Header */}
        <div className="h-16 bg-graphite-900 border-b border-graphite-700 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-brand-purple/20 border border-brand-purple/40 text-brand-gold flex items-center justify-center shadow-glow-purple">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-slate-100 flex items-center space-x-2">
                <span>Citizen Fraud Safety AI Assistant</span>
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Powered by Gemini Explainable Reasoning Engine
              </p>
            </div>
          </div>

          {/* Multilingual Selector */}
          <div className="flex items-center space-x-2 bg-graphite-850 border border-graphite-700 p-1 rounded-xl">
            <Globe className="w-4 h-4 text-slate-400 ml-2" />
            <span className="text-xs font-mono text-slate-400">Lang:</span>
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedLanguage === 'en' ? 'bg-brand-indigo text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedLanguage === 'hi' ? 'bg-brand-indigo text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिंदी (HI)
            </button>
            <button
              onClick={() => setSelectedLanguage('ta')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedLanguage === 'ta' ? 'bg-brand-indigo text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ் (TA)
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSession?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            const displayResult = msg.translatedResult || msg.result;
            const currentLang = msg.currentLanguage || 'en';

            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-brand-purple/30 border border-brand-purple/50 text-brand-gold flex items-center justify-center shrink-0 mr-3 mt-1 shadow-glow-purple/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble Body */}
                  <div
                    className={`p-4 rounded-2xl text-xs font-sans leading-relaxed ${
                      isUser
                        ? 'bg-brand-indigo text-slate-100 rounded-tr-none shadow-md font-mono'
                        : 'bg-graphite-900 border border-graphite-700 text-slate-200 rounded-tl-none shadow-xl'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    ) : (
                      <div className="space-y-4">
                        {/* Welcome text or plain text */}
                        {!displayResult && <div>{msg.text}</div>}

                        {/* Structured AI Verdict Card */}
                        {displayResult && (
                          <div className="space-y-4">
                            {/* Card Header & Risk Badge */}
                            <div className="flex items-center justify-between border-b border-graphite-700 pb-3">
                              <div className="flex items-center space-x-3">
                                {displayResult.prediction === 'Scam' ? (
                                  <div className="w-9 h-9 rounded-xl bg-signal-red/20 border border-signal-red text-signal-red flex items-center justify-center">
                                    <AlertOctagon className="w-5 h-5" />
                                  </div>
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-signal-green/20 border border-signal-green text-signal-green flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-serif font-bold text-base text-slate-100">
                                    {displayResult.prediction === 'Scam' ? '⚠ Scam Detected' : '✔ Legitimate Communication'}
                                  </h4>
                                  <div className="text-[11px] font-mono text-slate-400">
                                    Confidence Score: <strong className="text-brand-gold">{displayResult.confidence}%</strong>
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`px-3 py-1 text-xs font-mono font-bold border rounded-lg ${
                                  displayResult.prediction === 'Scam'
                                    ? 'bg-signal-red/20 text-signal-red border-signal-red/40'
                                    : 'bg-signal-green/20 text-signal-green border-signal-green/40'
                                }`}
                              >
                                {displayResult.risk?.toUpperCase() || 'HIGH'} RISK
                              </span>
                            </div>

                            {/* Triggered Red Flag Indicators */}
                            {displayResult.triggeredSignals && displayResult.triggeredSignals.length > 0 && (
                              <div>
                                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-signal-amber inline" />
                                  <span>TRIGGERED RED FLAGS</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {displayResult.triggeredSignals.map((sig, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-signal-red/10 border border-signal-red/30 text-signal-red"
                                    >
                                      {sig}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Explainable AI Reasoning */}
                            <div>
                              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1">
                                <Sparkles className="w-3.5 h-3.5 text-brand-gold inline" />
                                <span>EXPLAINABLE AI REASONING</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed font-sans bg-graphite-850 p-3 rounded-xl border border-graphite-800">
                                {displayResult.explanation}
                              </p>
                            </div>

                            {/* Recommended Actions */}
                            {displayResult.recommendedActions && displayResult.recommendedActions.length > 0 && (
                              <div>
                                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-signal-green inline" />
                                  <span>RECOMMENDED SAFETY ACTIONS</span>
                                </div>
                                <ul className="space-y-1 text-xs text-slate-300 font-sans">
                                  {displayResult.recommendedActions.map((act, aIdx) => (
                                    <li key={aIdx} className="flex items-start space-x-2">
                                      <span className="text-brand-gold font-bold">•</span>
                                      <span>{act}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Citizen Report Callout Prompt */}
                            {displayResult.prediction === 'Scam' && (
                              <div className="bg-gradient-to-r from-brand-indigo/30 to-graphite-850 border border-brand-purple/40 p-3 rounded-xl flex items-center justify-between mt-3">
                                <div className="text-xs text-slate-200">
                                  Would you like to report this incident to the National Cyber Crime Command Center?
                                </div>
                                <button
                                  onClick={() => {
                                    // Find user's original query text
                                    const userMsgIdx = activeSession.messages.findIndex((m) => m.id === msg.id);
                                    const prevUserMsg = activeSession.messages[userMsgIdx - 1]?.text || msg.text;
                                    handleReportClick(prevUserMsg, displayResult);
                                  }}
                                  className="bg-brand-indigo hover:bg-brand-purple text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1 shrink-0 ml-3 shadow-glow-purple transition-all"
                                >
                                  <span>Report Incident</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Bar below Assistant Message */}
                  {!isUser && msg.result && (
                    <div className="flex items-center space-x-1 text-[11px] font-mono pt-1 pl-1 flex-wrap gap-y-1">
                      {/* Copy Action */}
                      <button
                        onClick={() => {
                          const userMsgIdx = activeSession.messages.findIndex((m) => m.id === msg.id);
                          const prevUserMsg = activeSession.messages[userMsgIdx - 1]?.text || msg.text;
                          handleCopyReport(prevUserMsg, displayResult);
                        }}
                        className="px-2.5 py-1 bg-graphite-900 border border-graphite-700 hover:bg-graphite-800 text-slate-300 rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy Report</span>
                      </button>

                      {/* Report Action */}
                      <button
                        onClick={() => {
                          const userMsgIdx = activeSession.messages.findIndex((m) => m.id === msg.id);
                          const prevUserMsg = activeSession.messages[userMsgIdx - 1]?.text || msg.text;
                          handleReportClick(prevUserMsg, displayResult);
                        }}
                        className="px-2.5 py-1 bg-graphite-900 border border-graphite-700 hover:bg-graphite-800 text-signal-red rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <FilePlus className="w-3 h-3 text-signal-red" />
                        <span>Report Incident</span>
                      </button>

                      {/* Translate Buttons */}
                      <div className="flex items-center space-x-1 bg-graphite-900 border border-graphite-700 rounded-lg px-2 py-0.5">
                        <Languages className="w-3 h-3 text-brand-gold" />
                        <button
                          onClick={() => handleTranslateMessage(msg.id, 'en')}
                          className={`px-1.5 py-0.5 text-[10px] rounded ${currentLang === 'en' ? 'bg-brand-indigo text-white' : 'text-slate-400'}`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => handleTranslateMessage(msg.id, 'hi')}
                          className={`px-1.5 py-0.5 text-[10px] rounded ${currentLang === 'hi' ? 'bg-brand-indigo text-white' : 'text-slate-400'}`}
                        >
                          HI
                        </button>
                        <button
                          onClick={() => handleTranslateMessage(msg.id, 'ta')}
                          className={`px-1.5 py-0.5 text-[10px] rounded ${currentLang === 'ta' ? 'bg-brand-indigo text-white' : 'text-slate-400'}`}
                        >
                          TA
                        </button>
                      </div>

                      {/* Analyze Again */}
                      <button
                        onClick={() => {
                          const userMsgIdx = activeSession.messages.findIndex((m) => m.id === msg.id);
                          const prevUserMsg = activeSession.messages[userMsgIdx - 1]?.text || msg.text;
                          void handleSendMessage(prevUserMsg);
                        }}
                        className="px-2.5 py-1 bg-graphite-900 border border-graphite-700 hover:bg-graphite-800 text-slate-400 rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Re-analyze</span>
                      </button>
                    </div>
                  )}

                  {/* Message Timestamp */}
                  <div className={`text-[10px] font-mono text-slate-500 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator Animation */}
          {loading && (
            <div className="flex items-center space-x-3 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-brand-purple/30 border border-brand-purple/50 text-brand-gold flex items-center justify-center shrink-0 shadow-glow-purple/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-graphite-900 border border-graphite-700 p-3.5 rounded-2xl rounded-tl-none flex items-center space-x-2 text-xs font-mono text-slate-400 shadow-xl">
                <span>Reasoning over scam indicators...</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-graphite-700 bg-graphite-900 shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="relative bg-graphite-950 border border-graphite-700 rounded-2xl p-2 focus-within:border-brand-purple shadow-2xl transition-all">
              <textarea
                rows={2}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste suspicious SMS, WhatsApp message, email, or UPI payment link... (Press Enter to send, Shift+Enter for newline)"
                className="w-full bg-transparent p-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none resize-none"
              />

              <div className="flex items-center justify-between px-2 pt-1 border-t border-graphite-800">
                <div className="text-[10px] font-mono text-slate-500">
                  Enter to send | Shift + Enter for line break
                </div>

                <button
                  onClick={() => void handleSendMessage()}
                  disabled={loading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-purple hover:to-brand-indigo text-white font-mono text-xs font-bold py-1.5 px-4 rounded-xl shadow-glow-purple flex items-center space-x-1.5 transition-all disabled:opacity-40"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
