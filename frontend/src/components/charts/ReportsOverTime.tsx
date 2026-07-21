import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ReportsOverTimeProps {
  data: Array<{ date: string; count: number }>;
}

export const ReportsOverTime: React.FC<ReportsOverTimeProps> = ({ data }) => {
  return (
    <div className="bg-graphite-900 border border-graphite-700 rounded-2xl p-4 flex flex-col h-72">
      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
        INCIDENTS OVER TIME (PAST 30 DAYS)
      </h4>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2E3848" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1A202A', borderColor: '#2E3848', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#C9A74D' }}
            />
            <Line type="monotone" dataKey="count" stroke="#6750A4" strokeWidth={2} dot={{ fill: '#C9A74D', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
