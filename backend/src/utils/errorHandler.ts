import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { sendError } from './responseFormatter';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
    // Maintain correct stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

export class MessageTooLargeError extends AppError {
  constructor(maxLength: number) {
    super(413, 'MESSAGE_TOO_LARGE', `Message exceeds maximum allowed length of ${maxLength} characters.`);
    this.name = 'MessageTooLargeError';
  }
}

export class GeminiUnavailableError extends AppError {
  constructor(detail?: string) {
    super(502, 'GEMINI_UNAVAILABLE', `Gemini API is currently unavailable. ${detail ?? ''}`);
    this.name = 'GeminiUnavailableError';
  }
}

export class GeminiTimeoutError extends AppError {
  constructor() {
    super(408, 'GEMINI_TIMEOUT', 'Gemini API request timed out. Please try again.');
    this.name = 'GeminiTimeoutError';
  }
}

export class InvalidGeminiResponseError extends AppError {
  constructor() {
    super(502, 'INVALID_GEMINI_RESPONSE', 'Gemini returned an invalid or unparseable response.');
    this.name = 'InvalidGeminiResponseError';
  }
}


export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Known application errors — use their status code and code
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.code} — ${err.message}`);
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }
  if ((err as unknown as Record<string, unknown>)['type'] === 'entity.too.large') {
    sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
    return;
  }

  // Unexpected errors — log stack trace, return generic 500
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
  });
  sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected internal server error occurred.');
}

/** 404 handler for unregistered routes */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found.`);
}
