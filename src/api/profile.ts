import { HttpError, ok, parseInput } from '../http/respond.ts';
import type { Route } from '../http/router.ts';
import { ProfileSchema } from '../schemas/profile.ts';
import type { AppContext } from './context.ts';

// GET and PUT /api/profile: the candidate profile every score is based on (FR-01).
export function profileRoutes(context: AppContext): Route[] {
  return [
    {
      method: 'GET',
      path: '/api/profile',
      handler: () => {
        const profile = context.repos.profile.get();
        if (profile === null) {
          throw new HttpError(404, 'not_found', 'No profile yet: load data/profile.json with PUT /api/profile');
        }
        return ok(profile);
      },
    },
    {
      method: 'PUT',
      path: '/api/profile',
      handler: (request) => {
        const profile = parseInput(ProfileSchema, request.body, 'profile');
        context.repos.profile.put(profile, context.now());
        return ok(profile);
      },
    },
  ];
}
