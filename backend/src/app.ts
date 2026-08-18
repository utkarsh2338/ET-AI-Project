
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './utils/errorHandler';
import { logger } from './utils/logger';

export function createApp(): Application {
  const app = express();

  // ── Security Headers (helmet) ──
  app.use(helmet());

  // ── CORS ──
  app.use(cors({
    origin: (_origin, callback) => {
      // Reflect incoming origin to support production Vercel domain, previews, and localhost
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ── Rate Limiting ──
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please wait before sending another.',
      },
    },
  });
  app.use(limiter);

  // ── Request Logging Middleware ──
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, { ip: req.ip });
    next();
  });

  // ── API Routes ──
  app.use('/api', routes);

  // ── 404 Handler (must be after routes) ──
  app.use(notFoundHandler);

  // ── Global Error Handler (must be last) ──
  app.use(errorHandler);

  return app;
}
