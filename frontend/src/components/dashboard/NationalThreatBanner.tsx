import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Radio, Flame, ChevronRight } from 'lucide-react';
import { MapMarker } from '../../types';

interface NationalThreatBannerProps {
  markers: MapMarker[];
  onSelectDistrict?: (district: string) => void;
}

export const NationalThreatBanner: React.FC<NationalThreatBannerProps> = ({ markers, onSelectDistrict }) => {
  const [threatAlerts, setThreatAlerts] = useState<Array<{ text: string; district?: string; severity: string }>>([
    { text: '🚨 Rising UPI Fraud Reports in Maharashtra & Mumbai region', district: 'Mumbai', severity: 'Critical' },
    { text: '⚠ Fake KYC Verification Scams Increasing in Lucknow & Uttar Pradesh', district: 'Lucknow', severity: 'High' },
    { text: '🔴 Courier Package Address Scams Detected in New Delhi & NCR Grid', district: 'New Delhi', severity: 'Critical' },
    { text: '⚡ Job Fraud & Investment Scams Spiking in Bengaluru Tech Corridor', district: 'Bengaluru', severity: 'High' },
    { text: '🛡️ National Cyber Crime Portal Alert: Do not share 6-digit OTP with callers', severity: 'Medium' },
  ]);

  useEffect(() => {
    if (markers && markers.length > 0) {
      const topHotspots = [...markers].sort((a, b) => b.hotspotScore - a.hotspotScore).slice(0, 5);
      const generated = topHotspots.map((m) => {
        const icon = m.priorityLevel === 'Critical' ? '🚨' : '⚠';
        return {
          text: `${icon} ${m.priorityLevel} Cyber Fraud Hotspot: ${m.district} (${m.state}) — Score: ${m.hotspotScore}/100`,
          district: m.district,
          severity: m.priorityLevel,
        };
      });
      setThreatAlerts(generated);
    }
  }, [markers]);

  return (
    <div className="bg-graphite-900 border-b border-graphite-700 h-9 px-4 flex items-center overflow-hidden shrink-0 select-none font-mono text-xs text-slate-200">
      <div className="flex items-center space-x-2 shrink-0 bg-signal-red/20 text-signal-red px-2.5 py-0.5 rounded-md border border-signal-red/40 mr-3">
        <Radio className="w-3 h-3 animate-pulse" />
        <span className="font-bold text-[11px] uppercase tracking-wider">NATIONAL THREAT GRID</span>
      </div>

      {/* Marquee Ticker */}
      <div className="flex-1 overflow-hidden relative">
        <div className="whitespace-nowrap inline-flex items-center space-x-8 animate-marquee">
          {threatAlerts.map((alert, idx) => (
            <div
              key={idx}
              onClick={() => alert.district && onSelectDistrict && onSelectDistrict(alert.district)}
              className={`inline-flex items-center space-x-2 cursor-pointer hover:underline ${
                alert.severity === 'Critical' ? 'text-signal-red font-bold' : 'text-signal-amber'
              }`}
            >
              <span>{alert.text}</span>
              {alert.district && <ChevronRight className="w-3 h-3 inline text-slate-500" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
