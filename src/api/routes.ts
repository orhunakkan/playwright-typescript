import type { Route } from '../http/router.ts';
import type { AppContext } from './context.ts';
import { healthRoutes } from './health.ts';
import { jobRoutes } from './jobs.ts';
import { linkedinRoutes } from './linkedin.ts';
import { profileRoutes } from './profile.ts';
import { runRoutes } from './runs.ts';

// Every JSON API route of PLAN.md §6.1.
export function apiRoutes(context: AppContext): Route[] {
  return [
    ...healthRoutes(context),
    ...profileRoutes(context),
    ...runRoutes(context),
    ...jobRoutes(context),
    ...linkedinRoutes(context),
  ];
}
