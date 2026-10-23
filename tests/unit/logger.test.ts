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
