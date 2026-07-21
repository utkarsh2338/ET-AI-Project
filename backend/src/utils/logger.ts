type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

const isDevelopment = process.env['NODE_ENV'] !== 'production';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const output = isDevelopment
    ? formatDev(entry)
    : JSON.stringify(entry);

  if (level === 'error') {
    console.error(output);
  } else {
    console.log(output);
  }
}

/** Developer-friendly colored output */
function formatDev(entry: LogEntry): string {
  const colors: Record<LogLevel, string> = {
    info: '\x1b[36m',  // cyan
    warn: '\x1b[33m',  // yellow
    error: '\x1b[31m',  // red
    debug: '\x1b[90m',  // grey
  };
  const reset = '\x1b[0m';
  const { level, message, timestamp, ...rest } = entry;
  const metaStr = Object.keys(rest).length
    ? ` | ${JSON.stringify(rest)}`
    : '';
  return `${colors[level]}[${level.toUpperCase()}]${reset} ${timestamp} — ${message}${metaStr}`;
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),

  /** Log Gemini API call timing */
  geminiLatency: (latencyMs: number, model: string) =>
    log('info', 'Gemini API call completed', { latencyMs, model }),

  /** Log the full prediction pipeline timing */
  predictionTime: (totalMs: number, message_length: number) =>
    log('info', 'Prediction pipeline completed', { totalMs, message_length }),

  /** Log feature extraction timing */
  featureExtractionTime: (latencyMs: number) =>
    log('info', 'Feature extraction completed', { latencyMs }),
};
