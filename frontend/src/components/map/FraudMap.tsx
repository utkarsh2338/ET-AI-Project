import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  if (reportCount > 50) return 14;
  return 10;
}

/**
 * Validates & autocorrects swapped lat/lng values for Indian geography.
 * Bounds: 6° N <= Latitude <= 38° N, 68° E <= Longitude <= 98° E
 */
function validateAndCorrectCoordinate(rawLat: number, rawLng: number): { lat: number; lng: number; isValid: boolean } {
  if (typeof rawLat !== 'number' || typeof rawLng !== 'number' || isNaN(rawLat) || isNaN(rawLng)) {
    return { lat: 0, lng: 0, isValid: false };
  }

  let lat = rawLat;
  let lng = rawLng;

  // Detect and autocorrect swapped lat/lng (e.g. lat=77.5, lng=12.9)
  if (lat > 50 && lng < 50) {
    const temp = lat;
    lat = lng;
    lng = temp;
  }

  // Enforce geographical boundary check (6 <= lat <= 38, 68 <= lng <= 98)
  const isValid = lat >= 6.0 && lat <= 38.0 && lng >= 68.0 && lng <= 98.0;
  return { lat, lng, isValid };
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
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatGroupRef = useRef<L.LayerGroup | null>(null);

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

    markerGroupRef.current = L.layerGroup().addTo(map);
    heatGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Update Markers and Heatmap ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const markerGroup = markerGroupRef.current;
    const heatGroup = heatGroupRef.current;
    if (!map || !markerGroup || !heatGroup) return;

    markerGroup.clearLayers();
    heatGroup.clearLayers();

    // Map position registry for anti-overlap clustering offset
    const positionCounts: Record<string, number> = {};

    // Filter and process valid India coordinates
    const validMarkers = markers
      .map((m) => {
        const check = validateAndCorrectCoordinate(m.latitude, m.longitude);
        return {
          ...m,
          latitude: check.lat,
          longitude: check.lng,
          isValid: check.isValid,
        };
      })
      .filter((m) => m.isValid);

    // 1. Render Markers Layer
    if (showMarkers) {
      validMarkers.forEach((m) => {
        const color = getPriorityColor(m.hotspotScore);
        const radius = getMarkerRadius(m.reportCount);
        const isSelected = selectedDistrict?.district === m.district;

        // Calculate anti-overlap slight offset if multiple markers share exact coordinate
        const posKey = `${m.latitude.toFixed(3)},${m.longitude.toFixed(3)}`;
        const count = positionCounts[posKey] || 0;
        positionCounts[posKey] = count + 1;

        let renderLat = m.latitude;
        let renderLng = m.longitude;

        if (count > 0) {
          const angle = count * 0.8;
          const offsetDist = 0.012 * Math.sqrt(count);
          renderLat += offsetDist * Math.cos(angle);
          renderLng += offsetDist * Math.sin(angle);
        }

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

        const marker = L.marker([renderLat, renderLng], { icon });
        const priorityLabel = getPriorityLabel(m.hotspotScore);

        const popupHtml = `
          <div style="font-family: sans-serif; padding: 4px; color: #F8FAFC;">
            <strong style="font-size: 14px; color: #F8FAFC; display: block; margin-bottom: 2px;">${m.district}</strong>
            <span style="font-size: 11px; color: #94A3B8; display: block; margin-bottom: 6px;">${m.state}</span>
            <div style="display: flex; items-center; justify-content: space-between; gap: 8px; font-size: 11px; font-family: monospace;">
              <span>Score: <strong style="color: ${color};">${m.hotspotScore}/100</strong></span>
              <span>Reports: <strong>${m.reportCount}</strong></span>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          className: 'custom-leaflet-popup',
          closeButton: false,
          maxWidth: 260,
        });

        marker.on('click', () => {
          onSelectDistrict(m);
        });

        markerGroup.addLayer(marker);
      });
    }

    // 2. Render Heatmap Layer using corrected coordinates
    if (showHeatmap) {
      validMarkers.forEach((m) => {
        const color = getPriorityColor(m.hotspotScore);
        const radius = Math.max(25, (m.hotspotScore / 100) * 60);

        const circle = L.circle([m.latitude, m.longitude], {
          radius: radius * 1000,
          color: color,
          fillColor: color,
          fillOpacity: 0.18,
          weight: 1,
        });

        heatGroup.addLayer(circle);
      });
    }
  }, [markers, selectedDistrict, onSelectDistrict, showMarkers, showHeatmap]);

  // ── Fly To Selected District ──────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selectedDistrict) return;
    const check = validateAndCorrectCoordinate(selectedDistrict.latitude, selectedDistrict.longitude);
    if (check.isValid) {
      mapRef.current.flyTo([check.lat, check.lng], 8, {
        duration: 1.5,
      });
    }
  }, [selectedDistrict]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
