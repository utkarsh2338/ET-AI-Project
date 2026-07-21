import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });


function getEnvVar(key: string, required: true): string;
function getEnvVar(key: string, required: false, fallback: string): string;
function getEnvVar(key: string, required: boolean, fallback?: string): string {
  const value = process.env[key];
  if (!value) {
    if (required) {
      throw new Error(
        `[Config] Missing required environment variable: ${key}. ` +
        `Copy .env.example to .env and fill in all required values.`
      );
    }
    return fallback as string;
  }
  return value;
}


export const config = {
  geminiApiKey: getEnvVar('GEMINI_API_KEY', true),
  model: getEnvVar('MODEL', false, 'gemini-1.5-flash'),
  port: parseInt(getEnvVar('PORT', false, '3000'), 10),
  nodeEnv: getEnvVar('NODE_ENV', false, 'development'),
  maxMessageLength: parseInt(getEnvVar('MAX_MESSAGE_LENGTH', false, '5000'), 10),
  geminiTimeoutMs: parseInt(getEnvVar('GEMINI_TIMEOUT_MS', false, '15000'), 10),
  rateLimitWindowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', false, '60000'), 10),
  rateLimitMax: parseInt(getEnvVar('RATE_LIMIT_MAX', false, '60'), 10),
  mongodbUri: getEnvVar('MONGODB_URI', true),
  socketCorsOrigin: getEnvVar('SOCKET_CORS_ORIGIN', false, 'http://localhost:5173'),
  dedupWindowSeconds: parseInt(getEnvVar('DEDUP_WINDOW_SECONDS', false, '300'), 10),
  isDevelopment: process.env['NODE_ENV'] !== 'production',
} as const;

