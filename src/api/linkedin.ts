import { ok } from '../http/respond.ts';
import type { Route } from '../http/router.ts';
import { linkedInSessionStatus } from '../linkedin/session.ts';
import type { AppContext } from './context.ts';

// GET /api/linkedin/session: whether the owner's saved LinkedIn login can still be used (DEC-032). It only reads the
// file; it never contacts LinkedIn (NFR-03) and never returns cookie values (NFR-12).
export function linkedinRoutes(ctx: AppContext): Route[] {
  return [
    {
      method: 'GET',
      path: '/api/linkedin/session',
      handler: () => ok(linkedInSessionStatus(ctx.linkedinSessionPath, ctx.now())),
    },
  ];
}
