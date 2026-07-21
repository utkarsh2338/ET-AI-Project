import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapMarker } from '../../types';

interface FraudMapProps {
  markers: MapMarker[];
  selectedDistrict: MapMarker | null;
  onSelectDistrict: (marker: MapMarker) => void;
  showMarkers: boolean;
  showHeatmap: boolean;
}

function getPriorityColor(score: number): string {
  if (score <= 30) return '#10B981'; // Green
  if (score <= 60) return '#F59E0B'; // Yellow
  if (score <= 80) return '#F97316'; // Orange
  return '#EF4444'; // Red
}

function getPriorityLabel(score: number): string {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MEDIUM';
  if (score <= 80) return 'HIGH';
  return 'CRITICAL';
}

function getMarkerRadius(reportCount: number): number {
  if (reportCount > 300) return 22;
  if (reportCount > 150) return 18;
  if (reportCount > 50)  return 14;
  return 10;
}

export const FraudMap: React.FC<FraudMapProps> = ({
  markers,
  selectedDistrict,
  onSelectDistrict,
  showMarkers,
  showHeatmap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<any>(null);

  // ── Initialize Leaflet Map ────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // India geographic center
    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: false,
    });

    // Dark Matter tile layer (CartoDB Dark)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Update Markers and Heatmap ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Render Markers
    if (showMarkers) {
      markers.forEach((m) => {
        const color = getPriorityColor(m.hotspotScore);
        const radius = getMarkerRadius(m.reportCount);
        const isSelected = selectedDistrict?.district === m.district;

        // Custom HTML marker icon with pulse ring effect for high/critical score
        const isHighRisk = m.hotspotScore > 60;
        const iconHtml = `
          <div style="position: relative; width: ${radius * 2}px; height: ${radius * 2}px; display: flex; align-items: center; justify-content: center;">
            ${
              isHighRisk
                ? `<div class="animate-pulse-ring" style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${color}; opacity: 0.6;"></div>`
                : ''
            }
            <div style="
              width: ${radius * 1.5}px;
              height: ${radius * 1.5}px;
              border-radius: 50%;
              background: ${color};
              border: 2px solid ${isSelected ? '#FFFFFF' : '#14181F'};
              box-shadow: 0 0 12px ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <span style="font-size: 9px; font-weight: bold; color: #FFFFFF; font-family: 'IBM Plex Mono';">
                ${m.hotspotScore}
              </span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-leaflet-marker',
          iconSize: [radius * 2, radius * 2],
          iconAnchor: [radius, radius],
        });

        const marker = L.marker([m.latitude, m.longitude], { icon });

        // Tooltip hover
        const priorityLabel = getPriorityLabel(m.hotspotScore);
        marker.bindTooltip(
          `
            <div style="font-family: 'IBM Plex Sans'; padding: 4px 6px;">
              <div style="font-weight: bold; font-size: 12px;">${m.district}, ${m.state}</div>
              <div style="font-size: 11px; color: ${color}; font-weight: 600;">
                Score: ${m.hotspotScore}/100 (${priorityLabel})
              </div>
              <div style="font-size: 10px; color: #94A3B8;">${m.reportCount} incidents reported</div>
            </div>
          `,
          { direction: 'top', offset: [0, -radius] }
        );

        marker.on('click', () => {
          onSelectDistrict(m);
        });

        layerGroup.addLayer(marker);
      });
    }

    // 2. Render Heatmap Layer
    if (showHeatmap && (window as any).L && (window as any).L.heatLayer) {
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }

      const heatData = markers.map((m) => [
        m.latitude,
        m.longitude,
        m.hotspotScore / 100, // intensity 0..1
      ]);

      const heat = (window as any).L.heatLayer(heatData, {
        radius: 35,
        blur: 25,
        maxZoom: 10,
        gradient: {
          0.2: '#10B981',
          0.5: '#F59E0B',
          0.8: '#F97316',
          1.0: '#EF4444',
        },
      });

      heat.addTo(map);
      heatmapLayerRef.current = heat;
    } else if (!showHeatmap && heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }
  }, [markers, selectedDistrict, showMarkers, showHeatmap, onSelectDistrict]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
