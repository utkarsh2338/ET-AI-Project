import { config } from './config/env';
import { createApp } from './app';
import { logger } from './utils/logger';
import { initSocketIO } from './services/socketService';
import http from 'http';
import mongoose from 'mongoose';

async function connectMongoDB(): Promise<void> {
  const start = Date.now();
  await mongoose.connect(config.mongodbUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  logger.info(`✅ MongoDB connected`, { latencyMs: Date.now() - start });
}

async function main(): Promise<void> {
  // ── Database ──────────────────────────────────────────────────
  await connectMongoDB();

  // ── Express App ───────────────────────────────────────────────
  const app = createApp();
  const server = http.createServer(app);

  // ── Socket.IO ─────────────────────────────────────────────────
  initSocketIO(server);

  // ── Start Listening ───────────────────────────────────────────
  server.listen(config.port, () => {
    logger.info(`🚀 Fraud Command API running on port ${config.port}`, {
      env: config.nodeEnv,
      model: config.model,
    });
    logger.info(`📡 Health:     http://localhost:${config.port}/api/health`);
    logger.info(`🗺️  Dashboard:  GET http://localhost:${config.port}/api/dashboard`);
    logger.info(`🔥 Hotspots:   GET http://localhost:${config.port}/api/hotspots`);
    logger.info(`📋 Reports:    GET http://localhost:${config.port}/api/reports`);
    logger.info(`🔍 Predict:    POST http://localhost:${config.port}/api/predict`);
    logger.info(`⚡ Socket.IO:  ws://localhost:${config.port}`);
  });

  // ── Graceful Shutdown ─────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      logger.info('HTTP server closed.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.on('SIGINT',  () => { void shutdown('SIGINT'); });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', { reason: String(reason) });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: (err as Error).message });
    process.exit(1);
  });
}

main().catch((err: Error) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
