import { describe, expect, it } from 'vitest';
import {
  isAllowedHost,
  isCrossSite,
  isJsonContentType,
  isStateChanging,
  SECURITY_HEADERS,
} from '../../../src/http/security.ts';

describe('isAllowedHost', () => {
  it.each(['127.0.0.1:3000', 'localhost:3000', 'LocalHost:3000'])('NFR-01: accepts %s on port 3000', (host) => {
    expect(isAllowedHost(host, 3000)).toBe(true);
  });

  it.each([
    undefined,
    '',
    '127.0.0.1',
    'localhost',
    '127.0.0.1:3001',
    'evil.example:3000',
    'localhost.evil.example:3000',
    '127.0.0.1:3000.evil.example',
    '[::1]:3000',
    '0.0.0.0:3000',
  ])('NFR-01: refuses %j on port 3000', (host) => {
    expect(isAllowedHost(host, 3000)).toBe(false);
  });
});

describe('isCrossSite', () => {
  it.each<[string, Record<string, string>, boolean]>([
    ['no browser headers (curl)', {}, false],
    ['own Origin', { origin: 'http://127.0.0.1:3000' }, false],
    ['own localhost Origin', { origin: 'http://localhost:3000' }, false],
    ['Sec-Fetch-Site same-origin', { 'sec-fetch-site': 'same-origin' }, false],
    ['Sec-Fetch-Site none', { 'sec-fetch-site': 'none' }, false],
    ['foreign Origin', { origin: 'http://evil.example' }, true],
    ['Origin on another port', { origin: 'http://127.0.0.1:3001' }, true],
    ['null Origin', { origin: 'null' }, true],
    ['https Origin', { origin: 'https://127.0.0.1:3000' }, true],
    ['Sec-Fetch-Site cross-site', { 'sec-fetch-site': 'cross-site' }, true],
    ['Sec-Fetch-Site same-site', { 'sec-fetch-site': 'same-site' }, true],
    [
      'same-origin claim with a foreign Origin',
      { 'sec-fetch-site': 'same-origin', origin: 'http://evil.example' },
      true,
    ],
  ])('NFR-01: %s → cross-site = %s', (_case, headers, expected) => {
    expect(isCrossSite(headers, 3000)).toBe(expected);
  });
});

describe('isJsonContentType', () => {
  it.each([
    ['application/json', true],
    ['application/json; charset=utf-8', true],
    ['APPLICATION/JSON', true],
    [' application/json ', true],
    ['text/plain', false],
    ['application/x-www-form-urlencoded', false],
    ['multipart/form-data; boundary=x', false],
    ['application/jsonp', false],
    ['application/json-patch+json', false],
    ['', false],
    [undefined, false],
  ] as const)('NFR-09: %j → %s', (contentType, expected) => {
    expect(isJsonContentType(contentType)).toBe(expected);
  });
});

describe('isStateChanging', () => {
  it.each([
    ['POST', true],
    ['PUT', true],
    ['PATCH', true],
    ['DELETE', true],
    ['GET', false],
    ['HEAD', false],
    ['OPTIONS', false],
  ] as const)('NFR-01: %s → %s', (method, expected) => {
    expect(isStateChanging(method)).toBe(expected);
  });
});

describe('SECURITY_HEADERS', () => {
  it('NFR-07: include the headers of PLAN.md §8.1 type 6', () => {
    expect(SECURITY_HEADERS['Content-Security-Policy']).toMatch(/default-src 'self'.*frame-ancestors 'none'/);
    expect(SECURITY_HEADERS).toMatchObject({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
  });
});
