import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', description: 'Open Quick Command Palette' },
    { key: 'Ctrl + /', description: 'Open Keyboard Shortcuts Reference' },
    { key: 'Ctrl + Enter', description: 'Send Message in AI Checker' },
    { key: 'Shift + Enter', description: 'Insert Line Break in Textarea' },
    { key: 'Esc', description: 'Close any active modal or drawer' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-graphite-900 border border-graphite-700 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 font-mono text-xs text-slate-100">
        <div className="flex items-center justify-between border-b border-graphite-700 pb-3">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-brand-gold" />
            <h3 className="font-serif font-bold text-base text-slate-100">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="p-2.5 bg-graphite-850 border border-graphite-700 rounded-xl flex items-center justify-between">
              <span className="text-slate-300">{s.description}</span>
              <kbd className="px-2 py-1 bg-graphite-950 border border-graphite-700 rounded text-[11px] font-bold text-brand-gold">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="bg-brand-indigo text-white px-4 py-2 rounded-xl font-bold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
