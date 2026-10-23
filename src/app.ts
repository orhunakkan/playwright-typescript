import { readFileSync } from 'node:fs';
import type { Server } from 'node:http';
import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import type { AppContext } from './api/context.ts';
import { apiRoutes } from './api/routes.ts';
import { openDatabase } from './db/database.ts';
import { migrate } from './db/migrate.ts';
import { createRepositories } from './db/repositories/index.ts';
import { createAppServer } from './http/server.ts';
import type { Logger } from './logger.ts';

// Starts the app: database → migrations → HTTP server on 127.0.0.1 only (NFR-01). Used by main.ts and tests.

export interface StartOptions {
  port: number; // 0 picks a free port (tests)
  dbPath: string;
  logger: Logger;
  now?: () => string;
}

export interface RunningApp {
  port: number;
  url: string;
  server: Server;
  db: DatabaseSync;
  /** Stops accepting connections, lets open requests finish (at most `graceMs`), then closes the database. */
  close(graceMs?: number): Promise<void>;
}

const HOST = '127.0.0.1';

export async function startApp(options: StartOptions): Promise<RunningApp> {
  const db = openDatabase(options.dbPath);
  try {
    migrate(db);
    const ctx: AppContext = {
      db,
      repos: createRepositories(db),
      now: options.now ?? (() => new Date().toISOString()),
      version: readVersion(),
    };
    const server = createAppServer(apiRoutes(ctx), options.logger);
    const port = await listen(server, options.port);

    let closing: Promise<void> | undefined;
    return {
      port,
      url: `http://${HOST}:${String(port)}`,
      server,
      db,
      close(graceMs = 5000) {
        closing ??= stop(server, db, graceMs);
        return closing;
      },
    };
  } catch (error) {
    db.close();
    throw error;
  }
}

function listen(server: Server, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, HOST, () => {
      server.off('error', reject);
      const address = server.address();
      resolve(typeof address === 'object' && address !== null ? address.port : port);
    });
  });
}

async function stop(server: Server, db: DatabaseSync, graceMs: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const deadline = setTimeout(() => {
      server.closeAllConnections();
    }, graceMs);
    server.close((error) => {
      clearTimeout(deadline);
      if (error === undefined) resolve();
      else reject(error);
    });
    server.closeIdleConnections();
  });
  if (db.isOpen) db.close();
}

function readVersion(): string {
  const pkg: unknown = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  return z.object({ version: z.string() }).parse(pkg).version;
}
