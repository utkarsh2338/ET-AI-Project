import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { submitReport } from '../../lib/api';

import { PrefillReportData } from '../../types';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillData?: PrefillReportData | null;
}

const DISTRICT_COORDS: Record<string, { state: string; lat: number; lng: number }> = {
  'New Delhi':   { state: 'Delhi',          lat: 28.6139, lng: 77.2090 },
  'Mumbai':      { state: 'Maharashtra',    lat: 19.0760, lng: 72.8777 },
  'Bengaluru':   { state: 'Karnataka',      lat: 12.9716, lng: 77.5946 },
  'Lucknow':     { state: 'Uttar Pradesh',  lat: 26.8467, lng: 80.9462 },
  'Hyderabad':   { state: 'Telangana',      lat: 17.3850, lng: 78.4867 },
  'Chennai':     { state: 'Tamil Nadu',     lat: 13.0827, lng: 80.2707 },
  'Kolkata':     { state: 'West Bengal',    lat: 22.5726, lng: 88.3639 },
  'Jaipur':      { state: 'Rajasthan',      lat: 26.9124, lng: 75.7873 },
  'Patna':       { state: 'Bihar',          lat: 25.5941, lng: 85.1376 },
  'Noida':       { state: 'Uttar Pradesh',  lat: 28.5355, lng: 77.3910 },
};

export const ReportForm: React.FC<ReportFormProps> = ({ isOpen, onClose, onSuccess, prefillData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('UPI Fraud');
  const [district, setDistrict] = useState('Lucknow');
  const [state, setState] = useState('Uttar Pradesh');
  const [severity, setSeverity] = useState('High');
  const [lat, setLat] = useState(26.8467);
  const [lng, setLng] = useState(80.9462);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Sync prefillData whenever modal opens with prefilled content
  React.useEffect(() => {
    if (prefillData) {
      if (prefillData.title) setTitle(prefillData.title);
      if (prefillData.description) setDescription(prefillData.description);
      if (prefillData.category) setCategory(prefillData.category);
      if (prefillData.severity) setSeverity(prefillData.severity);
      if (prefillData.district) {
        setDistrict(prefillData.district);
        const info = DISTRICT_COORDS[prefillData.district];
        if (info) {
          setState(info.state);
          setLat(info.lat);
          setLng(info.lng);
        }
      }
    }
  }, [prefillData, isOpen]);

  if (!isOpen) return null;

  function handleDistrictChange(selectedDistrict: string) {
    setDistrict(selectedDistrict);
    const info = DISTRICT_COORDS[selectedDistrict];
    if (info) {
      setState(info.state);
      setLat(info.lat);
      setLng(info.lng);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await submitReport({
        title,
        description,
        category,
        district,
        state,
        latitude: lat,
        longitude: lng,
        severity,
      });

      setSubmittedId(res.reportId);
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-graphite-900 border border-graphite-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-graphite-700 bg-graphite-850 flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-100">Submit Citizen Fraud Report</h2>
            <p className="text-xs text-slate-400 font-mono">
              Live updates national threat grid via Socket.IO
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {submittedId ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-signal-green/20 border border-signal-green text-signal-green flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-100">Report Successfully Submitted!</h3>
              <p className="text-xs font-mono text-slate-400">
                Incident ID: <span className="text-brand-gold font-bold">{submittedId}</span>
              </p>
              <p className="text-xs text-slate-300">
                Backend has updated district statistics, recalculated hotspot score, generated an AI enforcement recommendation, and broadcast the alert live across connected command centers.
              </p>
              <button
                onClick={() => {
                  setSubmittedId(null);
                  setTitle('');
                  setDescription('');
                  onClose();
                }}
                className="bg-brand-indigo hover:bg-brand-purple text-white px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-signal-red/20 border border-signal-red/50 text-signal-red text-xs font-mono flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fake Bank Customer Care Call Requesting OTP"
                  className="w-full bg-graphite-950 border border-graphite-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Fraud Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-graphite-950 border border-graphite-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-purple"
                  >
                    <option value="UPI Fraud">UPI Fraud</option>
                    <option value="Banking Fraud">Banking Fraud</option>
                    <option value="OTP Scam">OTP Scam</option>
                    <option value="Phishing">Phishing</option>
                    <option value="Lottery Scam">Lottery Scam</option>
                    <option value="Job Fraud">Job Fraud</option>
                    <option value="Investment Scam">Investment Scam</option>
                    <option value="KYC Scam">KYC Scam</option>
                    <option value="Impersonation">Impersonation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Severity *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-graphite-950 border border-graphite-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-purple"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-graphite-950 border border-graphite-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-purple"
                  >
                    {Object.keys(DISTRICT_COORDS).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={state}
                    className="w-full bg-graphite-950 border border-graphite-700 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Incident Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about caller, phone numbers, fake UPI IDs, links, or money requested..."
                  className="w-full bg-graphite-950 border border-graphite-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-purple hover:to-brand-indigo text-white font-mono text-xs font-bold py-2.5 px-6 rounded-xl shadow-glow-purple flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Transmitting...' : 'Submit Report'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
