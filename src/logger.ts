import { styleText } from 'node:util';

// Logger (PLAN.md §4.2). `json`: one object per line on stdout with time, level, msg and any fields, for pipes, CI
// and tests. `pretty`: one short coloured line per entry, for a person watching `npm start` in a terminal. Colours
// come from util.styleText, which leaves them out when stdout is not a terminal or NO_COLOR is set.

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
export const LOG_FORMATS = ['json', 'pretty'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];
export type LogFormat = (typeof LOG_FORMATS)[number];

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
  format: LogFormat = 'json',
): Logger {
  const threshold = LOG_LEVELS.indexOf(level);
  const log =
    (at: LogLevel) =>
    (msg: string, fields: LogFields = {}) => {
      if (LOG_LEVELS.indexOf(at) < threshold) return;
      write(
        format === 'json'
          ? JSON.stringify({ time: now(), level: at, msg, ...fields }, errorReplacer)
          : prettyLine(now(), at, msg, fields),
      );
    };
  return { debug: log('debug'), info: log('info'), warn: log('warn'), error: log('error') };
}

// Errors have no enumerable properties, so JSON.stringify would log them as {}.
function errorReplacer(_key: string, value: unknown): unknown {
  return value instanceof Error ? { name: value.name, message: value.message, stack: value.stack } : value;
}

type Style = Parameters<typeof styleText>[0];

const LEVEL_STYLES: Record<LogLevel, Style> = {
  debug: 'gray',
  info: 'cyan',
  warn: 'yellow',
  error: ['red', 'bold'],
};

const CLOCK = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// "14:03:07  200  GET /jobs/12  4 ms" for requests; "14:03:07  WARN   msg  key=value" for everything else.
function prettyLine(time: string, at: LogLevel, msg: string, fields: LogFields): string {
  const clock = styleText('dim', CLOCK.format(new Date(time)));
  const { method, path, status, ms } = fields;
  if (msg === 'request' && typeof status === 'number') {
    const statusText = styleText(statusStyle(status), String(status));
    return `${clock}  ${statusText}  ${String(method)} ${String(path)}  ${styleText('dim', `${String(ms)} ms`)}`;
  }

  const label = styleText(LEVEL_STYLES[at], at.toUpperCase().padEnd(5));
  const details = Object.entries(fields).map(([key, value]) => `${styleText('dim', `${key}=`)}${show(value)}`);
  const stacks = Object.values(fields)
    .filter((value): value is Error => value instanceof Error)
    .map((error) => `\n${styleText('dim', error.stack ?? error.message)}`);
  return [clock, label, msg, ...details].join('  ') + stacks.join('');
}

function statusStyle(status: number): Style {
  if (status >= 500) return ['red', 'bold'];
  if (status >= 400) return 'yellow';
  if (status >= 300) return 'cyan';
  return 'green';
}

function show(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  return typeof value === 'string' ? value : JSON.stringify(value);
}
