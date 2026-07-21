import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'default' | 'red' | 'green' | 'amber' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'default',
}) => {
  const colorClasses = {
    default: 'text-slate-100 border-graphite-700 bg-graphite-850',
    red:     'text-signal-red border-signal-red/30 bg-graphite-850 shadow-glow-red/20',
    green:   'text-signal-green border-signal-green/30 bg-graphite-850',
    amber:   'text-signal-amber border-signal-amber/30 bg-graphite-850',
    purple:  'text-brand-gold border-brand-purple/40 bg-graphite-850 shadow-glow-purple/20',
  };

  const iconColors = {
    default: 'text-slate-400',
    red:     'text-signal-red',
    green:   'text-signal-green',
    amber:   'text-signal-amber',
    purple:  'text-brand-gold',
  };

  return (
    <div className={`border p-4 rounded-2xl flex items-center justify-between ${colorClasses[color]}`}>
      <div>
        <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </div>
        <div className="text-2xl font-mono font-extrabold mt-1 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-graphite-900 border border-graphite-700 ${iconColors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
