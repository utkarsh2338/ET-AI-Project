import { Request, Response, NextFunction } from 'express';
import { predict, extractOnly } from '../services/predictionService';
import { sendSuccess, sendError } from '../utils/responseFormatter';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { ValidationError, MessageTooLargeError } from '../utils/errorHandler';
import { AnalyzeRequest } from '../types';

function validateMessageRequest(body: unknown): string {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be a JSON object.');
  }

  const { message } = body as AnalyzeRequest;

  if (message === undefined || message === null) {
    throw new ValidationError('Field "message" is required.');
  }

  if (typeof message !== 'string') {
    throw new ValidationError('Field "message" must be a string.');
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    throw new ValidationError('Field "message" must not be empty.');
  }

  if (trimmed.length > config.maxMessageLength) {
    throw new MessageTooLargeError(config.maxMessageLength);
  }

  return trimmed;
}

export async function handlePredict(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const startTime = Date.now();
  try {
    const message = validateMessageRequest(req.body);
    logger.info('Prediction request received', { message_length: message.length });

    const result = await predict(message);
    sendSuccess(res, result, 200, startTime);
  } catch (err) {
    next(err);
  }
}


export function handleExtractFeatures(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startTime = Date.now();
  try {
    const message = validateMessageRequest(req.body);
    const features = extractOnly(message);
    sendSuccess(res, { features }, 200, startTime);
  } catch (err) {
    next(err);
  }
}


export async function handleTranslate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const startTime = Date.now();
  try {
    const { data, targetLanguage } = req.body as {
      data: {
        verdict: string;
        explanation: string;
        triggered_signals: string[];
        recommended_actions: string[];
      };
      targetLanguage: 'hi' | 'ta' | 'en';
    };

    if (!data || !targetLanguage) {
      throw new ValidationError('Fields "data" and "targetLanguage" are required.');
    }

    const { translateAnalysisResult } = await import('../services/geminiService');
    const translated = await translateAnalysisResult(data, targetLanguage);
    sendSuccess(res, translated, 200, startTime);
  } catch (err) {
    next(err);
  }
}

export function handleMethodNotAllowed(_req: Request, res: Response): void {
  sendError(res, 405, 'METHOD_NOT_ALLOWED', 'This endpoint only accepts POST requests.');
}

