---
name: stlc-env
description: STLC phase 4, test environment readiness. Checks the target, browsers and Docker, the pinned API contract against the live one, and the per-run user setup.
argument-hint: <feature>
disable-model-invocation: true
---

# Phase 4: environment readiness for `$0`

No agent. Commands only.

1. Run `npm run stlc:gate -- $0 env`. If it exits 1, stop and report its reasons.
2. Run `npm run env:check`. If it exits 1, stop and report the FAIL lines. Nothing downstream is
   meaningful while the target or browsers are missing. A WARN about Docker matters only if the
   plan has visual tests; if it does, stop.
3. **Contract drift.**
   1. Run `npm run contract:pull`, then `git diff --stat -- contracts/`.
   2. If the diff is empty, report "contract unchanged".
   3. If not, show the user a short summary (`git diff -- contracts/ | head -80`). Then restore the
      pinned copy with `git checkout -- contracts/openapi.json`. Tests validate against the
      reviewed pin.
   4. Report the drift as a finding for the user to decide on. Don't stop.
4. Run `npx playwright test --project=setup`. It registers this run's user and signs in. If it
   fails, stop and report its error: login is broken or the target is blocking us.
5. Report one line per check.
