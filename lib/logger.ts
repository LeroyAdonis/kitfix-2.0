/**
 * Structured logger for KitFix 2.0.
 *
 * - Production: JSON output (timestamp, level, message, optional data)
 * - Development: human-readable coloured output
 *
 * All application code should use this logger instead of raw console calls.
 */

type LogData = Record<string, unknown>;

type LogLevel = "info" | "warn" | "error";

// ---------------------------------------------------------------------------
// Serialisation helpers
// ---------------------------------------------------------------------------

/** Convert Error instances to plain objects so JSON.stringify captures them. */
function serializeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function serializeData(data: LogData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = serializeValue(value);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const ANSI = {
  reset: "\x1b[0m",
  info: "\x1b[36m",  // cyan
  warn: "\x1b[33m",  // yellow
  error: "\x1b[31m", // red
  dim: "\x1b[2m",    // dim (for timestamp)
} as const;

function formatJson(level: LogLevel, message: string, data?: LogData): string {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data ? serializeData(data) : {}),
  });
}

function formatDev(level: LogLevel, message: string, data?: LogData): string {
  const color = ANSI[level];
  const tag = `${color}[${level.toUpperCase()}]${ANSI.reset}`;
  const ts = `${ANSI.dim}${new Date().toLocaleTimeString()}${ANSI.reset}`;
  const suffix = data ? ` ${JSON.stringify(serializeData(data))}` : "";
  return `${ts} ${tag} ${message}${suffix}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const isProduction = process.env.NODE_ENV === "production";
const fmt = isProduction ? formatJson : formatDev;

export const logger = {
  info(message: string, data?: LogData): void {
    console.log(fmt("info", message, data));
  },
  warn(message: string, data?: LogData): void {
    console.warn(fmt("warn", message, data));
  },
  error(message: string, data?: LogData): void {
    console.error(fmt("error", message, data));
  },
} as const;
