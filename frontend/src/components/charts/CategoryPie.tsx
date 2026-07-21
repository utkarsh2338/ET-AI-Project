import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface CategoryPieProps {
  data: Array<{ category: string; count: number }>;
}

const COLORS = ['#6750A4', '#C9A74D', '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B'];

export const CategoryPie: React.FC<CategoryPieProps> = ({ data }) => {
  return (
    <div className="bg-graphite-900 border border-graphite-700 rounded-2xl p-4 flex flex-col h-72">
      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
        FRAUD CATEGORY DISTRIBUTION
      </h4>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1A202A', borderColor: '#2E3848', borderRadius: '8px', fontSize: '12px' }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
