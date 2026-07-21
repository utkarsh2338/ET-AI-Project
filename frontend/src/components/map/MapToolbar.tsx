import React from 'react';
import { Layers, Flame, MapPin } from 'lucide-react';

interface MapToolbarProps {
  showMarkers: boolean;
  setShowMarkers: (show: boolean) => void;
  showHeatmap: boolean;
  setShowHeatmap: (show: boolean) => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  showMarkers,
  setShowMarkers,
  showHeatmap,
  setShowHeatmap,
}) => {
  return (
    <div className="absolute top-4 left-4 z-10 bg-graphite-900/90 backdrop-blur-md border border-graphite-700 rounded-xl p-1.5 flex items-center space-x-1 shadow-2xl">
      <button
        onClick={() => {
          setShowMarkers(true);
          setShowHeatmap(false);
        }}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
          showMarkers && !showHeatmap
            ? 'bg-brand-indigo text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-graphite-800'
        }`}
      >
        <MapPin className="w-3.5 h-3.5" />
        <span>MARKERS</span>
      </button>

      <button
        onClick={() => {
          setShowMarkers(false);
          setShowHeatmap(true);
        }}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
          !showMarkers && showHeatmap
            ? 'bg-brand-indigo text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-graphite-800'
        }`}
      >
        <Flame className="w-3.5 h-3.5" />
        <span>HEATMAP</span>
      </button>

      <button
        onClick={() => {
          setShowMarkers(true);
          setShowHeatmap(true);
        }}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
          showMarkers && showHeatmap
            ? 'bg-brand-indigo text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-graphite-800'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>BOTH</span>
      </button>
    </div>
  );
};
