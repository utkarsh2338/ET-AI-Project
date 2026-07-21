import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';
import { MapMarker, Report } from '../types';

export interface NewReportEvent {
  type: 'NEW_REPORT';
  report: Report;
  districtStats: MapMarker;
  recommendation: { priority: string; recommendation: string };
  timestamp: string;
}

export interface HotspotUpdateEvent {
  type: 'HOTSPOT_UPDATE';
  districtStats: MapMarker;
  timestamp: string;
}

export function useSocket(
  onNewReport?: (event: NewReportEvent) => void,
  onHotspotUpdate?: (event: HotspotUpdateEvent) => void,
) {
  const [isConnected, setIsConnected] = useState(false);
  const [liveConnections, setLiveConnections] = useState(1);
  const [recentEvents, setRecentEvents] = useState<NewReportEvent[]>([]);

  useEffect(() => {
    const socket = getSocket();

    function updateStatus() {
      setIsConnected(socket.connected);
    }

    function handleConnectionCount(data: { count: number }) {
      setLiveConnections(data.count);
    }

    function handleNewReport(event: NewReportEvent) {
      setRecentEvents((prev) => [event, ...prev.slice(0, 19)]);
      if (onNewReport) onNewReport(event);
    }

    function handleHotspotUpdate(event: HotspotUpdateEvent) {
      if (onHotspotUpdate) onHotspotUpdate(event);
    }

    socket.on('connect', updateStatus);
    socket.on('disconnect', updateStatus);
    socket.on('connect_error', updateStatus);
    socket.on('CONNECTION_COUNT', handleConnectionCount);
    socket.on('NEW_REPORT', handleNewReport);
    socket.on('HOTSPOT_UPDATE', handleHotspotUpdate);

    // Initial check & interval backup for async connection state changes
    updateStatus();
    const interval = setInterval(updateStatus, 1500);

    return () => {
      clearInterval(interval);
      socket.off('connect', updateStatus);
      socket.off('disconnect', updateStatus);
      socket.off('connect_error', updateStatus);
      socket.off('CONNECTION_COUNT', handleConnectionCount);
      socket.off('NEW_REPORT', handleNewReport);
      socket.off('HOTSPOT_UPDATE', handleHotspotUpdate);
    };
  }, [onNewReport, onHotspotUpdate]);

  return { isConnected, liveConnections, recentEvents };
}
