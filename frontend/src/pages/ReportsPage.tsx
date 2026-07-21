import React from 'react';
import { ReportTable } from '../components/reports/ReportTable';

export const ReportsPage: React.FC = () => {
  return (
    <div className="flex-1 p-6 bg-graphite-950 overflow-hidden flex flex-col">
      <ReportTable />
    </div>
  );
};
