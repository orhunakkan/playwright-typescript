import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer, type Server } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

// Runs src/main.ts as `npm start` does, as a separate process with its own environment.
const root = fileURLToPath(new URL('../../', import.meta.url));

interface Started {
  child: ChildProcess;
  output: () => { stdout: string; stderr: string };
  exited: Promise<number | null>;
}

function startMain(env: Record<string, string>): Started {
  const inherited = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !['PORT', 'DB_PATH', 'LOG_LEVEL'].includes(key)),
  );
  const child = spawn(process.execPath, ['src/main.ts'], { cwd: root, env: { ...inherited, ...env } });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk: Buffer) => (stdout += chunk.toString()));
  child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()));
  const exited = new Promise<number | null>((resolve) => child.once('exit', resolve));
  return { child, output: () => ({ stdout, stderr }), exited };
}

async function waitFor(check: () => boolean, ms = 10_000): Promise<void> {
  const deadline = Date.now() + ms;
  while (!check()) {
    if (Date.now() > deadline) throw new Error('timed out');
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() => {
        resolve(typeof address === 'object' && address !== null ? address.port : 0);
      });
    });
  });
}

describe('src/main.ts', () => {
  // Steps run newest first: a child process must have exited before Windows lets its database be deleted.
  const cleanup: (() => unknown)[] = [];
  afterEach(async () => {
    for (const step of cleanup.splice(0).reverse()) await step();
  });

  function tempDbPath(): string {
    const dir = mkdtempSync(join(tmpdir(), 'jobboard-main-'));
    cleanup.push(() => {
      rmSync(dir, { recursive: true, force: true });
    });
    return join(dir, 'nested', 'jobboard.db');
  }

  it('NFR-01: starts on 127.0.0.1:PORT, serves health and logs JSON lines', async () => {
    const port = await freePort();
    const main = startMain({ PORT: String(port), DB_PATH: tempDbPath(), LOG_LEVEL: 'info' });
    cleanup.push(() => {
      main.child.kill();
      return main.exited;
    });

    await waitFor(() => main.output().stdout.includes('"msg":"listening"'));
    const health = await fetch(`http://127.0.0.1:${String(port)}/api/health`);

    expect(health.status).toBe(200);
    expect(await health.json()).toMatchObject({ status: 'ok', db: 'ok' });
    const listening = JSON.parse(main.output().stdout.split('\n')[0] ?? '') as Record<string, unknown>;
    expect(listening).toMatchObject({ level: 'info', msg: 'listening', url: `http://127.0.0.1:${String(port)}` });
  });

  it('NFR-09: exits with 1 and a clear message when the configuration is invalid', async () => {
    const main = startMain({ PORT: 'eighty', LOG_LEVEL: 'loud' });

    expect(await main.exited).toBe(1);
    expect(main.output().stderr).toContain('Invalid configuration (check .env, see .env.example):');
    expect(main.output().stderr).toContain('PORT: must be a whole number');
    expect(main.output().stderr).toContain('DB_PATH: is required');
    expect(main.output().stderr).toContain('LOG_LEVEL:');
  });

  it('NFR-09: exits with 1 and logs why when the port is already taken', async () => {
    const blocker: Server = createServer();
    await new Promise<void>((resolve) => blocker.listen(0, '127.0.0.1', resolve));
    cleanup.push(() => blocker.close());
    const address = blocker.address();
    const port = typeof address === 'object' && address !== null ? address.port : 0;

    const main = startMain({ PORT: String(port), DB_PATH: tempDbPath() });

    expect(await main.exited).toBe(1);
    expect(main.output().stdout).toContain('"msg":"failed to start"');
    expect(main.output().stdout).toContain('EADDRINUSE');
  });
});
