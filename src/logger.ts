// JSON-lines logger (PLAN.md §4.2): one object per line on stdout with time, level, msg and any fields.

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export type LogFields = Readonly<Record<string, unknown>>;

export interface Logger {
  debug(msg: string, fields?: LogFields): void;
  info(msg: string, fields?: LogFields): void;
  warn(msg: string, fields?: LogFields): void;
  error(msg: string, fields?: LogFields): void;
}

export function createLogger(
  level: LogLevel,
  write: (line: string) => void = (line) => process.stdout.write(`${line}\n`),
  now: () => string = () => new Date().toISOString(),
): Logger {
  const threshold = LOG_LEVELS.indexOf(level);
  const log =
    (at: LogLevel) =>
    (msg: string, fields: LogFields = {}) => {
      if (LOG_LEVELS.indexOf(at) < threshold) return;
      write(JSON.stringify({ time: now(), level: at, msg, ...fields }, errorReplacer));
    };
  return { debug: log('debug'), info: log('info'), warn: log('warn'), error: log('error') };
}

// Errors have no enumerable properties, so JSON.stringify would log them as {}.
function errorReplacer(_key: string, value: unknown): unknown {
  return value instanceof Error ? { name: value.name, message: value.message, stack: value.stack } : value;
}
