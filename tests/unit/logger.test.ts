import { stripVTControlCharacters } from 'node:util';
import { describe, expect, it, vi } from 'vitest';
import { createLogger, type LogLevel } from '../../src/logger.ts';

function capture(level: LogLevel) {
  const lines: string[] = [];
  const logger = createLogger(
    level,
    (line) => lines.push(line),
    () => '2026-10-23T12:00:00.000Z',
  );
  return { logger, lines, parsed: () => lines.map((line) => JSON.parse(line) as Record<string, unknown>) };
}

describe('createLogger', () => {
  it('NFR-09: writes one JSON object per line with time, level, msg and the fields', () => {
    const { logger, lines, parsed } = capture('debug');

    logger.info('request', { requestId: 'r1', status: 200, ms: 3 });

    expect(lines).toHaveLength(1);
    expect(lines[0]).not.toContain('\n');
    expect(parsed()).toEqual([
      { time: '2026-10-23T12:00:00.000Z', level: 'info', msg: 'request', requestId: 'r1', status: 200, ms: 3 },
    ]);
  });

  it.each<[LogLevel, string[]]>([
    ['debug', ['debug', 'info', 'warn', 'error']],
    ['info', ['info', 'warn', 'error']],
    ['warn', ['warn', 'error']],
    ['error', ['error']],
  ])('NFR-09: at level %s it writes %j', (level, expected) => {
    const { logger, parsed } = capture(level);

    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');

    expect(parsed().map((line) => line['level'])).toEqual(expected);
  });

  it('NFR-09: logs an Error with its name, message and stack', () => {
    const { logger, parsed } = capture('error');

    logger.error('boom', { error: new TypeError('bad thing') });

    expect(parsed()[0]?.['error']).toMatchObject({
      name: 'TypeError',
      message: 'bad thing',
      stack: expect.stringContaining('bad thing') as unknown,
    });
  });

  it('NFR-09: fields cannot overwrite time, level or msg in a way that hides the real ones', () => {
    const { logger, parsed } = capture('info');

    logger.info('real', {});

    expect(parsed()[0]).toMatchObject({ msg: 'real', level: 'info' });
  });

  it('NFR-09: writes to stdout by default', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    let calls: unknown[][];
    try {
      createLogger('info').info('hello');
    } finally {
      calls = [...write.mock.calls]; // mockRestore() also clears the recorded calls
      write.mockRestore();
    }

    expect(calls).toHaveLength(1);
    expect(calls[0]?.[0]).toMatch(/^\{"time":"[^"]+","level":"info","msg":"hello"\}\n$/);
  });
});

describe('createLogger, pretty format (DEC-034)', () => {
  function pretty(level: LogLevel = 'debug') {
    const lines: string[] = [];
    const logger = createLogger(
      level,
      (line) => lines.push(stripVTControlCharacters(line)),
      () => '2026-10-23T12:00:00.000Z',
      'pretty',
    );
    return { logger, lines };
  }
  // The clock is local time, so only its shape is checked.
  const CLOCK = /^\d\d:\d\d:\d\d {2}/;

  it.each([200, 303, 404, 500])(
    'NFR-10: a request with status %i is one short line: time, status, method, path, time taken',
    (status) => {
      const { logger, lines } = pretty();

      logger.info('request', { requestId: 'r1', method: 'GET', path: '/jobs/12', status, ms: 4 });

      expect(lines).toHaveLength(1);
      expect(lines[0]).toMatch(CLOCK);
      expect(lines[0]?.replace(CLOCK, '')).toBe(`${String(status)}  GET /jobs/12  4 ms`);
    },
  );

  it('NFR-10: other entries show the level, the message and the fields as key=value', () => {
    const { logger, lines } = pretty();

    logger.warn('shutting down', { signal: 'SIGINT', count: 2 });

    expect(lines[0]?.replace(CLOCK, '')).toBe('WARN   shutting down  signal=SIGINT  count=2');
  });

  it('NFR-10: an Error shows its name and message, then its stack', () => {
    const { logger, lines } = pretty();

    logger.error('unhandled error', { error: new TypeError('bad thing') });

    const [first, ...stack] = (lines[0] ?? '').split('\n');
    expect(first?.replace(CLOCK, '')).toBe('ERROR  unhandled error  error=TypeError: bad thing');
    expect(stack.join('\n')).toContain('TypeError: bad thing');
  });

  it('NFR-10: the level threshold still applies', () => {
    const { logger, lines } = pretty('warn');

    logger.info('request', { method: 'GET', path: '/', status: 200, ms: 1 });
    logger.debug('d');

    expect(lines).toEqual([]);
  });
});
