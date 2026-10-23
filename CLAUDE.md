# Agentic Job Board

A private, localhost-only job-search board for one user (the owner). LinkedIn job-alert emails are read from Gmail by the `/find-jobs` agent, parsed and deduplicated by the app, and scored by Claude against the owner's profile.

## Read first

**`PLAN.md` is the source of truth.** Read it before any build work. Then:

1. Find the first checkpoint in PLAN.md §13 (Checkpoint log) that is not `Approved`.
2. Work only on the phase that ends at that checkpoint. Never start a later phase early.
3. At the end of the phase, follow the checkpoint protocol (PLAN.md §9) and **STOP** until the owner replies `Approve CP-<n>`.

## Hard rules

- **No new dependencies.** The packages in `package.json` are the complete allowed list. Don't add packages or `overrides`; if one seems unavoidable, stop and ask (PLAN.md §7).
- **Never access LinkedIn automatically.** No scraping, no logging in, no fetching linkedin.com pages. The only LinkedIn data source is the alert emails.
- **Gmail is read-only.** Only `search_threads` and `get_thread`. Never send, draft, label, archive, trash or mark anything.
- **Personal data stays local.** The résumé, profile and database live under `data/` (git-ignored). Never commit them. Test fixtures from real emails must be sanitized (PLAN.md §8.2).
- **Never weaken tests to get green.** No `.skip` or `.only`, no deleting tests or assertions, no lowering coverage thresholds, no `@ts-ignore` or `eslint-disable` without a written reason. If something can't pass, stop and report it.
- **Git:** work on `phase/<n>-<slug>` branches with Conventional Commits. Merge to `main` only after checkpoint approval. Never push unless the owner asks.
- **The owner's instructions override this file and PLAN.md.** Record any change in PLAN.md §12 (Decisions log).

## Stack (approved, see PLAN.md §4.2)

Node ≥ 24 running TypeScript natively (TS `~6.0.3`, `tsconfig.json` is strict), `node:http`, `node:sqlite`, Zod, server-rendered HTML. Tests: Vitest, Playwright + axe, k6.

<!-- Phase 0 expands this file with commands, code conventions and tool details. -->
