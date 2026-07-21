import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TopDistrictsProps {
  data: Array<{ district: string; state: string; hotspotScore: number; reportCount: number }>;
}

export const TopDistricts: React.FC<TopDistrictsProps> = ({ data }) => {
  return (
    <div className="bg-graphite-900 border border-graphite-700 rounded-2xl p-4 flex flex-col h-72">
      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
        TOP 10 HOTSPOT DISTRICTS BY RISK SCORE
      </h4>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2E3848" horizontal={false} />
            <XAxis type="number" stroke="#64748B" fontSize={10} domain={[0, 100]} />
            <YAxis dataKey="district" type="category" stroke="#E2E8F0" fontSize={11} width={80} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1A202A', borderColor: '#2E3848', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#EF4444' }}
            />
            <Bar dataKey="hotspotScore" fill="#EF4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
