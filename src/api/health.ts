import { HttpError, ok } from '../http/respond.ts';
import type { Route } from '../http/router.ts';
import type { AppContext } from './context.ts';

// GET /api/health: the server is up and the database answers (PLAN.md §6.1).
export function healthRoutes(context: AppContext): Route[] {
  return [
    {
      method: 'GET',
      path: '/api/health',
      handler: () => {
        try {
          context.db.prepare('SELECT 1').get();
        } catch {
          throw new HttpError(503, 'db_unavailable', 'The database is not available');
        }
        return ok({ status: 'ok', db: 'ok', version: context.version });
      },
    },
  ];
}
