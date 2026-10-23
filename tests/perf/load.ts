// Placeholder until Phase 7 (PLAN.md §10). It makes no requests, so `npm run test:perf`
// proves only that k6 is installed and can run a TypeScript script.
// Phase 7 replaces it with the real load test: 5,000 seeded jobs, ramp to 20 VUs,
// thresholds http_req_duration p(95)<200 and http_req_failed rate<0.01.
import { check } from 'k6';
import type { Options } from 'k6/options';

export const options: Options = {
  vus: 1,
  iterations: 1,
};

export default function (): void {
  check(null, { 'k6 runs TypeScript': () => true });
}
