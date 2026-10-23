import type { z } from 'zod';

// Replies and errors. JSON API replies (PLAN.md §6.1) carry a `body`, and every API error body is
// { "error": { "code": string, "message": string, "details"?: unknown } }. HTML pages, the stylesheet and
// redirects (§6.2) carry `text` with its content type.

export interface JsonReply {
  status: number;
  body: unknown;
  headers?: Readonly<Record<string, string>>;
}

export interface TextReply {
  status: number;
  text: string;
  contentType: string;
  headers?: Readonly<Record<string, string>>;
}

export type Reply = JsonReply | TextReply;

export function html(text: string, status = 200): TextReply {
  return { status, text, contentType: 'text/html; charset=utf-8' };
}

/** 303 See Other: after a form post the browser loads `location` with GET (post/redirect/get). */
export function redirect(location: string): TextReply {
  return { status: 303, text: '', contentType: 'text/plain; charset=utf-8', headers: { Location: location } };
}

export class HttpError extends Error {
  override name = 'HttpError';
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function ok(body: unknown, status = 200): JsonReply {
  return { status, body };
}

export function errorBody(code: string, message: string, details?: unknown): unknown {
  return { error: details === undefined ? { code, message } : { code, message, details } };
}

/** Parses untrusted input with `schema`; a mismatch is a 400 listing each problem and where it is. */
export function parseInput<T extends z.ZodType>(schema: T, value: unknown, what = 'request'): z.output<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
    throw new HttpError(400, 'validation_failed', `The ${what} is invalid`, details);
  }
  return parsed.data;
}

/** Turns a query string (or form body) into an object for Zod. A repeated key is ambiguous, so it is a 400. */
export function queryObject(query: URLSearchParams, what = 'query string'): Record<string, string> {
  const seen = new Map<string, string>();
  for (const [key, value] of query) {
    if (seen.has(key)) {
      throw new HttpError(400, 'validation_failed', `The ${what} is invalid`, [
        { path: key, message: 'must appear only once' },
      ]);
    }
    seen.set(key, value);
  }
  // fromEntries defines own properties, so a key like "__proto__" stays data (and strict schemas reject it)
  // instead of reaching the prototype setter, as `result[key] = value` would.
  return Object.fromEntries(seen);
}
