import { mkdtempSync, rmSync } from 'node:fs';
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startApp, type RunningApp } from '../../src/app.ts';
import { createLogger } from '../../src/logger.ts';
import { fakeClock } from './fixtures.ts';

// The real app on 127.0.0.1 with a free port and its own temporary database (PLAN.md §8.2).
// `call` uses the built-in fetch (API tests); `raw` uses node:http so tests can set any header,
// including Host, which fetch does not allow.

export interface ApiResponse {
  status: number;
  headers: Headers;
  body: unknown;
  text: string;
}

export interface RawResponse {
  status: number;
  headers: IncomingHttpHeaders;
  text: string;
}

export interface TestApp {
  app: RunningApp;
  url: string;
  port: number;
  logs: string[];
  call(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse>;
  get(path: string): Promise<ApiResponse>;
  post(path: string, body?: unknown): Promise<ApiResponse>;
  /** Posts an HTML form as a browser on this site would; redirects are returned, not followed. */
  form(path: string, fields: Record<string, string>, headers?: Record<string, string>): Promise<ApiResponse>;
  raw(options: {
    method?: string;
    path: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<RawResponse>;
  close(): Promise<void>;
}

export async function startTestApp(): Promise<TestApp> {
  const dir = mkdtempSync(join(tmpdir(), 'jobboard-api-'));
  const logs: string[] = [];
  const app = await startApp({
    port: 0,
    dbPath: join(dir, 'test.db'),
    logger: createLogger('debug', (line) => logs.push(line)),
    now: fakeClock('2026-10-23T12:00:00.000Z'),
  });

  async function call(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    const init: RequestInit = { method, headers: { ...headers } };
    if (body !== undefined) {
      init.headers = { 'Content-Type': 'application/json', ...headers };
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    const response = await fetch(`${app.url}${path}`, init);
    const text = await response.text();
    return {
      status: response.status,
      headers: response.headers,
      text,
      // HTML pages and redirects have no JSON body; their markup is in `text`.
      body: response.headers.get('content-type')?.startsWith('application/json')
        ? (JSON.parse(text) as unknown)
        : undefined,
    };
  }

  function raw(options: { method?: string; path: string; headers?: Record<string, string>; body?: string }) {
    return new Promise<RawResponse>((resolve, reject) => {
      const req = httpRequest(
        {
          host: '127.0.0.1',
          port: app.port,
          method: options.method ?? 'GET',
          path: options.path,
          headers: { Host: `127.0.0.1:${String(app.port)}`, ...options.headers },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => {
            resolve({
              status: res.statusCode ?? 0,
              headers: res.headers,
              text: Buffer.concat(chunks).toString('utf8'),
            });
          });
        },
      );
      req.on('error', reject);
      req.end(options.body);
    });
  }

  return {
    app,
    url: app.url,
    port: app.port,
    logs,
    call,
    get: (path) => call('GET', path),
    post: (path, body = {}) => call('POST', path, body),
    async form(path, fields, headers = {}) {
      const response = await fetch(`${app.url}${path}`, {
        method: 'POST',
        redirect: 'manual',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Origin: app.url,
          'Sec-Fetch-Site': 'same-origin',
          ...headers,
        },
        body: new URLSearchParams(fields).toString(),
      });
      const text = await response.text();
      return { status: response.status, headers: response.headers, text, body: undefined };
    },
    raw,
    async close() {
      await app.close(0);
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
