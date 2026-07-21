import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Report, FilterState } from '../../types';
import { fetchReports } from '../../lib/api';

function getSeverityBadgeClass(severity: string): string {
  switch (severity) {
    case 'Critical': return 'bg-signal-red/20 text-signal-red border-signal-red/40';
    case 'High':     return 'bg-signal-orange/20 text-signal-orange border-signal-orange/40';
    case 'Medium':   return 'bg-signal-amber/20 text-signal-amber border-signal-amber/40';
    default:         return 'bg-signal-green/20 text-signal-green border-signal-green/40';
  }
}

export const ReportTable: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    state: '',
    district: '',
    severity: '',
    status: '',
    category: '',
    search: '',
  });

  const loadData = async (currentPage = page) => {
    setLoading(true);
    try {
      const res = await fetchReports(filters, currentPage, 15);
      setReports(res.reports);
      setTotal(res.total);
      setPage(res.page);
      setPages(res.pages);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(1);
  }, [filters]);

  return (
    <div className="bg-graphite-900 border border-graphite-700 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header & Filter Bar */}
      <div className="p-4 border-b border-graphite-700 bg-graphite-850 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-gold" />
            <h2 className="font-serif font-bold text-lg text-slate-100">National Fraud Incident Registry</h2>
            <span className="text-xs font-mono text-slate-400">({total} total records)</span>
          </div>
          <button
            onClick={() => loadData(page)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-graphite-800 rounded-lg border border-graphite-700"
            title="Reload Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-5 gap-3">
          <div className="relative col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search title, description, district..."
              className="w-full bg-graphite-950 border border-graphite-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-brand-purple"
            />
          </div>

          <select
            value={filters.severity}
            onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
            className="bg-graphite-950 border border-graphite-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-purple"
          >
            <option value="">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="bg-graphite-950 border border-graphite-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-purple"
          >
            <option value="">All Categories</option>
            <option value="UPI Fraud">UPI Fraud</option>
            <option value="Banking Fraud">Banking Fraud</option>
            <option value="OTP Scam">OTP Scam</option>
            <option value="Phishing">Phishing</option>
            <option value="Lottery Scam">Lottery Scam</option>
            <option value="Job Fraud">Job Fraud</option>
            <option value="Investment Scam">Investment Scam</option>
            <option value="KYC Scam">KYC Scam</option>
            <option value="Impersonation">Impersonation</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="bg-graphite-950 border border-graphite-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-purple"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left font-mono text-xs text-slate-300">
          <thead className="bg-graphite-950 border-b border-graphite-700 text-slate-400 font-semibold sticky top-0 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Report ID</th>
              <th className="p-3">Title & Summary</th>
              <th className="p-3">Category</th>
              <th className="p-3">District / State</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Status</th>
              <th className="p-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  Loading incident registry...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  No reports found matching filters
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.reportId} className="hover:bg-graphite-850/60 transition-colors">
                  <td className="p-3 font-bold text-brand-gold">{r.reportId}</td>
                  <td className="p-3 max-w-xs">
                    <div className="font-semibold text-slate-100 font-sans text-xs truncate">{r.title}</div>
                    <div className="text-[11px] text-slate-400 font-sans line-clamp-1">{r.description}</div>
                  </td>
                  <td className="p-3 text-slate-300">{r.category}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-200">{r.district}</div>
                    <div className="text-[10px] text-slate-400">{r.state}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(r.severity)}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-graphite-800 text-slate-300 border border-graphite-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">
                    {new Date(r.timestamp).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-graphite-700 bg-graphite-850 flex items-center justify-between font-mono text-xs text-slate-400">
        <div>
          Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{pages}</strong>
        </div>
        <div className="flex items-center space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => loadData(page - 1)}
            className="p-1.5 bg-graphite-950 border border-graphite-700 rounded-lg hover:bg-graphite-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= pages}
            onClick={() => loadData(page + 1)}
            className="p-1.5 bg-graphite-950 border border-graphite-700 rounded-lg hover:bg-graphite-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
