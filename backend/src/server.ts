import { config } from './config/env';
import { createApp } from './app';
import { logger } from './utils/logger';
import http from 'http';

async function main(): Promise<void> {

  const app = createApp();
  const server = http.createServer(app);

  server.listen(config.port, () => {
    logger.info(`🚀 Scam Detection API running on port ${config.port}`, {
      env: config.nodeEnv,
      model: config.model,
    });
    logger.info(`📡 Health:   http://localhost:${config.port}/api/health`);
    logger.info(`🔍 Predict:  POST http://localhost:${config.port}/api/predict`);
    logger.info(`🧩 Features: POST http://localhost:${config.port}/api/extract-features`);
  });

  // ── Graceful Shutdown ──
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });

    // Force exit after 10s if connections haven't closed
    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', { reason: String(reason) });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

main().catch((err: Error) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
