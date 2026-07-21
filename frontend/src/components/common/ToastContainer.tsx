import React from 'react';
import { ShieldAlert, CheckCircle, Info, AlertTriangle, X, MapPin } from 'lucide-react';
import { useToast, ToastItem } from '../../hooks/useToast';

interface ToastContainerProps {
  onSelectDistrict?: (district: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ onSelectDistrict }) => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          info: <Info className="w-5 h-5 text-blue-400" />,
          success: <CheckCircle className="w-5 h-5 text-signal-green" />,
          warning: <AlertTriangle className="w-5 h-5 text-signal-amber" />,
          error: <ShieldAlert className="w-5 h-5 text-signal-red" />,
        };

        const borderColors = {
          info: 'border-blue-500/40 bg-graphite-900/95',
          success: 'border-signal-green/40 bg-graphite-900/95',
          warning: 'border-signal-amber/40 bg-graphite-900/95',
          error: 'border-signal-red/40 bg-graphite-900/95 shadow-glow-red/20',
        };

        return (
          <div
            key={toast.id}
            onClick={() => {
              if (toast.district && onSelectDistrict) {
                onSelectDistrict(toast.district);
              }
            }}
            className={`pointer-events-auto border rounded-xl p-3.5 shadow-2xl backdrop-blur-xl flex items-start space-x-3 transition-all animate-in slide-in-from-right-5 duration-300 ${
              borderColors[toast.type]
            } ${toast.district ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
          >
            <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-mono font-bold text-xs text-slate-100 truncate">{toast.title}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="text-slate-500 hover:text-slate-300 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5 line-clamp-2">{toast.message}</p>
              {toast.district && (
                <div className="flex items-center space-x-1 text-[10px] font-mono text-brand-gold mt-1">
                  <MapPin className="w-3 h-3 inline" />
                  <span>Click to locate {toast.district} on map</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
