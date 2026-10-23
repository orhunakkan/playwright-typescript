import { randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { InvalidEmailError, RunFinishedError, RunNotFoundError } from '../ingest/ingest-service.ts';
import { InvalidTransitionError, JobNotFoundError } from '../jobs/status-service.ts';
import type { Logger } from '../logger.ts';
import { errorBody, HttpError, type Reply } from './respond.ts';
import { createRouter, type RouteMatch, type Route } from './router.ts';
import { isAllowedHost, isCrossSite, isJsonContentType, isStateChanging, SECURITY_HEADERS } from './security.ts';

// The request pipeline (PLAN.md Phase 4), in order:
//   Host check (421) → cross-site check on writes (403) → route (404/405) → JSON content type on API
//   writes (415) → body ≤ 1 MB (413) → valid JSON (400) → handler → JSON reply with security headers.
// Every request gets an ID (X-Request-Id) and one log line.

export const BODY_LIMIT_BYTES = 1024 * 1024;
// Past the limit the body is read and thrown away so the client still gets its 413; past this, the socket is cut.
const DISCARD_LIMIT_BYTES = 16 * BODY_LIMIT_BYTES;

type Match = (method: string, path: string) => RouteMatch;

export function createAppServer(routes: readonly Route[], logger: Logger): Server {
  const match = createRouter(routes);
  return createServer((req, res) => {
    void handle(req, res, match, logger);
  });
}

async function handle(req: IncomingMessage, res: ServerResponse, match: Match, logger: Logger): Promise<void> {
  const started = performance.now();
  const requestId = randomUUID();
  const method = req.method ?? '';
  let path = '';

  let reply: Reply;
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    path = url.pathname;
    reply = await dispatch(req, method, url, match);
  } catch (error) {
    reply = toErrorReply(error, logger, requestId);
  }

  send(res, reply, requestId);
  logger.info('request', {
    requestId,
    method,
    path,
    status: reply.status,
    ms: Math.round(performance.now() - started),
  });
}

async function dispatch(req: IncomingMessage, method: string, url: URL, match: Match): Promise<Reply> {
  const port = req.socket.localPort ?? 0;
  if (!isAllowedHost(req.headers.host, port)) {
    throw new HttpError(421, 'misdirected_request', 'This server only answers to 127.0.0.1 or localhost on its port');
  }
  if (isStateChanging(method) && isCrossSite(req.headers, port)) {
    throw new HttpError(403, 'cross_site_request', 'Requests from other sites are not allowed');
  }

  const found = match(method, url.pathname);
  if (found.kind === 'not_found') throw new HttpError(404, 'not_found', 'There is nothing at this path');
  if (found.kind === 'method_not_allowed') {
    return {
      status: 405,
      body: errorBody('method_not_allowed', `Use ${found.allowed.join(' or ')} for this path`),
      headers: { Allow: found.allowed.join(', ') },
    };
  }

  let body: unknown;
  if (isStateChanging(method)) {
    if (!isJsonContentType(req.headers['content-type'])) {
      throw new HttpError(415, 'unsupported_media_type', 'Send the body as JSON with Content-Type: application/json');
    }
    body = parseJson(await readBody(req));
  }

  return found.route.handler({
    method: found.route.method,
    path: url.pathname,
    params: found.params,
    query: url.searchParams,
    body,
  });
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  const tooLarge = () => new HttpError(413, 'payload_too_large', 'The request body must be at most 1 MB');
  if (Number(req.headers['content-length'] ?? 0) > DISCARD_LIMIT_BYTES) {
    req.destroy();
    return Promise.reject(tooLarge());
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size <= BODY_LIMIT_BYTES) chunks.push(chunk);
      else if (size > DISCARD_LIMIT_BYTES) req.destroy();
    });
    req.on('end', () => {
      if (size > BODY_LIMIT_BYTES) reject(tooLarge());
      else resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

function parseJson(raw: Buffer): unknown {
  try {
    return JSON.parse(raw.toString('utf8')) as unknown;
  } catch {
    throw new HttpError(400, 'invalid_json', 'The request body is not valid JSON');
  }
}

function toErrorReply(error: unknown, logger: Logger, requestId: string): Reply {
  if (error instanceof HttpError) {
    return { status: error.status, body: errorBody(error.code, error.message, error.details) };
  }
  if (error instanceof JobNotFoundError || error instanceof RunNotFoundError) {
    return { status: 404, body: errorBody('not_found', error.message) };
  }
  if (error instanceof InvalidTransitionError) {
    return { status: 409, body: errorBody('invalid_transition', error.message, { from: error.from, to: error.to }) };
  }
  if (error instanceof RunFinishedError) {
    return { status: 409, body: errorBody('run_finished', error.message) };
  }
  if (error instanceof InvalidEmailError) {
    return { status: 400, body: errorBody('validation_failed', error.message) };
  }

  logger.error('unhandled error', { requestId, error });
  return { status: 500, body: errorBody('internal_error', `Something went wrong; see the server log (${requestId})`) };
}

function send(res: ServerResponse, reply: Reply, requestId: string): void {
  if (res.headersSent || res.destroyed) return;

  const payload = JSON.stringify(reply.body);
  res.writeHead(reply.status, {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
    'X-Request-Id': requestId,
    ...reply.headers,
  });
  res.end(payload);
}
