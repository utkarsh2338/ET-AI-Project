import { Response } from 'express';
import { ErrorResponse } from '../types';

/** Wraps data in a standard success envelope and sends the response */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  startTime?: number,
): void {
  const processingTimeMs = startTime ? Date.now() - startTime : 0;
  res.status(statusCode).json({
    success: true,
    data,
    meta: {
      processingTimeMs,
      timestamp: new Date().toISOString(),
    },
  });
}

/** Wraps an error in a standard error envelope and sends the response */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
): void {
  const body: ErrorResponse = {
    success: false,
    error: { code, message },
    meta: { timestamp: new Date().toISOString() },
  };
  res.status(statusCode).json(body);
}
