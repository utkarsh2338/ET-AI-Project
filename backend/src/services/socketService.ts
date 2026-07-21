/**
 * src/services/socketService.ts
 *
 * Socket.IO server management.
 * Provides broadcast helpers for live dashboard updates.
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from '../config/env';
import { logger } from '../utils/logger';

let _io: SocketIOServer | null = null;
let connectedClients = 0;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  _io = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  _io.on('connection', (socket: Socket) => {
    connectedClients++;
    logger.info('Socket connected', { socketId: socket.id, total: connectedClients });

    // Emit current connection count to all clients
    _io!.emit('CONNECTION_COUNT', { count: connectedClients });

    socket.on('disconnect', () => {
      connectedClients = Math.max(0, connectedClients - 1);
      logger.info('Socket disconnected', { socketId: socket.id, total: connectedClients });
      _io!.emit('CONNECTION_COUNT', { count: connectedClients });
    });

    // Client can subscribe to a specific district for targeted updates
    socket.on('SUBSCRIBE_DISTRICT', (district: string) => {
      void socket.join(`district:${district}`);
      logger.info('Client subscribed to district', { socketId: socket.id, district });
    });
  });

  logger.info('Socket.IO server initialized', { corsOrigin: config.socketCorsOrigin });
  return _io;
}

export function getIO(): SocketIOServer | null {
  return _io;
}

export function getConnectedClientCount(): number {
  return connectedClients;
}

/**
 * Broadcasts a new report event to all connected dashboards.
 */
export function broadcastNewReport(payload: {
  report: Record<string, unknown>;
  districtStats: Record<string, unknown>;
  recommendation: Record<string, unknown>;
}): void {
  if (!_io) return;
  const start = Date.now();
  _io.emit('NEW_REPORT', {
    type: 'NEW_REPORT',
    ...payload,
    timestamp: new Date().toISOString(),
  });
  logger.info('Socket NEW_REPORT broadcast', { latencyMs: Date.now() - start });
}

/**
 * Broadcasts a hotspot score update to all connected dashboards.
 * Also emits to the district-specific room.
 */
export function broadcastHotspotUpdate(districtStats: Record<string, unknown>): void {
  if (!_io) return;
  const district = districtStats['district'] as string;
  _io.emit('HOTSPOT_UPDATE', {
    type: 'HOTSPOT_UPDATE',
    districtStats,
    timestamp: new Date().toISOString(),
  });
  // Also send to district-specific room subscribers
  if (district) {
    _io.to(`district:${district}`).emit('DISTRICT_UPDATE', {
      type: 'DISTRICT_UPDATE',
      districtStats,
      timestamp: new Date().toISOString(),
    });
  }
}
