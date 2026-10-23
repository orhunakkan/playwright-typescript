import { describe, expect, it } from 'vitest';
import { ok } from '../../../src/http/respond.ts';
import { createRouter, type Route } from '../../../src/http/router.ts';

const handler = () => ok({});
const ROUTES: Route[] = [
  { method: 'GET', path: '/api/jobs', handler },
  { method: 'GET', path: '/api/jobs/:id', handler },
  { method: 'PATCH', path: '/api/jobs/:id', handler },
  { method: 'POST', path: '/api/runs/:id/emails', handler },
];
const match = createRouter(ROUTES);

describe('createRouter', () => {
  it('NFR-09: matches a fixed path', () => {
    expect(match('GET', '/api/jobs')).toEqual({ kind: 'found', route: ROUTES[0], params: {} });
  });

  it('NFR-09: captures path parameters', () => {
    expect(match('GET', '/api/jobs/42')).toMatchObject({ kind: 'found', route: ROUTES[1], params: { id: '42' } });
    expect(match('POST', '/api/runs/7/emails')).toMatchObject({ params: { id: '7' } });
  });

  it('NFR-09: picks the route for the request method', () => {
    expect(match('PATCH', '/api/jobs/42')).toMatchObject({ kind: 'found', route: ROUTES[2] });
  });

  it('NFR-09: decodes percent-encoded parameters', () => {
    expect(match('GET', '/api/jobs/a%20b')).toMatchObject({ params: { id: 'a b' } });
  });

  it.each([
    '/api/jobs/',
    '/api/jobs/42/extra',
    '/api',
    '/API/jobs',
    '/api/jobs//',
    '/api/runs//emails',
    '/api/jobs/%E0%A4%A',
    '',
  ])('NFR-09: %j matches no route', (path) => {
    expect(match('GET', path)).toEqual({ kind: 'not_found' });
  });

  it('NFR-09: a known path with another method lists the allowed methods', () => {
    expect(match('DELETE', '/api/jobs/42')).toEqual({ kind: 'method_not_allowed', allowed: ['GET', 'PATCH'] });
    expect(match('POST', '/api/jobs')).toEqual({ kind: 'method_not_allowed', allowed: ['GET'] });
  });
});
