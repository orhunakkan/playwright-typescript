import type { IncomingHttpHeaders } from 'node:http';

// Request checks and response headers for a single-user app on 127.0.0.1 (PLAN.md §8.1 type 6, NFR-01).
// Threat model: other websites open in the owner's browser. They can't read our responses, but they can
// try DNS rebinding (caught by the Host check) or send state-changing requests (caught by the origin check).

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  // same-origin, not no-referrer: with no-referrer, browsers send "Origin: null" on our own form posts, which the
  // cross-site check must refuse (DEF-009). Links to other sites (LinkedIn) still get no referrer.
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

const LOCAL_HOSTNAMES = ['127.0.0.1', 'localhost'];
const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** The Host header must name this server, or a rebound DNS name could reach it from another site. */
export function isAllowedHost(host: string | undefined, port: number): boolean {
  if (host === undefined) return false;
  return LOCAL_HOSTNAMES.some((name) => host.toLowerCase() === `${name}:${String(port)}`);
}

export function isStateChanging(method: string): boolean {
  return STATE_CHANGING.has(method);
}

/**
 * True when a browser says the request comes from another site. Browsers send Sec-Fetch-Site and Origin;
 * tools like curl send neither, and are allowed (only the owner can run them on this machine).
 */
export function isCrossSite(headers: IncomingHttpHeaders, port: number): boolean {
  const fetchSite = headers['sec-fetch-site'];
  if (fetchSite !== undefined && fetchSite !== 'same-origin' && fetchSite !== 'none') return true;

  const origin = headers.origin;
  if (origin === undefined) return false;
  return !LOCAL_HOSTNAMES.some((name) => origin.toLowerCase() === `http://${name}:${String(port)}`);
}

/** API writes must be JSON: application/json, with or without a charset parameter. */
export function isJsonContentType(contentType: string | undefined): boolean {
  return mediaType(contentType) === 'application/json';
}

/** Page writes are plain HTML form posts (multipart is never accepted: no page uploads files). */
export function isFormContentType(contentType: string | undefined): boolean {
  return mediaType(contentType) === 'application/x-www-form-urlencoded';
}

function mediaType(contentType: string | undefined): string | undefined {
  return contentType?.split(';')[0]?.trim().toLowerCase();
}
