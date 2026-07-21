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

    function handleConnect() {
      setIsConnected(true);
    }

    function handleDisconnect() {
      setIsConnected(false);
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

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('CONNECTION_COUNT', handleConnectionCount);
    socket.on('NEW_REPORT', handleNewReport);
    socket.on('HOTSPOT_UPDATE', handleHotspotUpdate);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('CONNECTION_COUNT', handleConnectionCount);
      socket.off('NEW_REPORT', handleNewReport);
      socket.off('HOTSPOT_UPDATE', handleHotspotUpdate);
    };
  }, [onNewReport, onHotspotUpdate]);

  return { isConnected, liveConnections, recentEvents };
}
