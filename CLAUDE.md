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
- **Git:** work on `phase/<n>-<slug>` branches with Conventional Commits. Merge to `main` only after checkpoint approval. **On approval, merge the phase branch to `main` and push `main` to `origin`** (DEC-018). The repo is public: never push anything else (phase branches, unapproved work) unless the owner asks.
- **The owner's instructions override this file and PLAN.md.** Record any change in PLAN.md §12 (Decisions log) and `docs/decisions.md`.

## Stack (approved, see PLAN.md §4.2)

Node ≥ 24 running TypeScript natively (TS `~6.0.3`, `tsconfig.json` is strict), `node:http`, `node:sqlite`, Zod, server-rendered HTML. Tests: Vitest, Playwright + axe, k6.

## Commands

| Command                               | What it does                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `npm run check`                       | typecheck + lint + format:check + unit tests with coverage. Run before every commit. |
| `npm run typecheck`                   | `tsc` on the repo, then on `tests/perf` (k6 types)                                   |
| `npm run lint` / `npm run format`     | ESLint (zero warnings) / Prettier write                                              |
| `npm run test:unit` … `test:security` | One Vitest project each: `unit`, `integration`, `api`, `contract`, `security`        |
| `npm run test:e2e` / `test:smoke`     | Playwright on chromium, firefox, webkit, mobile / `@smoke` on chromium               |
| `npm run test:perf`                   | k6 (`tests/perf/load.ts`); k6 is installed with `winget install k6`, not npm         |
| `npm run audit`                       | `npm audit --audit-level=high`                                                       |
| `npm start` / `npm run dev`           | App on `127.0.0.1:$PORT` (needs `.env`; copy `.env.example`)                         |

## Conventions

- File names are kebab-case.
- Named exports only. Default exports are allowed only in config files and k6 scripts (ESLint enforces this).
- No `any`. Use `unknown` and parse it with Zod at every boundary (HTTP, env, files, email text).
- Errors are typed classes (`class NotFoundError extends Error`), not bare strings or objects.
- Relative imports end in `.ts` (`import { x } from './y.ts'`). Node runs the sources directly.
- Tests import `describe`/`it`/`expect` from `vitest` explicitly. Name tests after the requirement they cover, e.g. `it('FR-04: …')`.
- Test files: `tests/<project>/**/*.test.ts` for Vitest, `tests/e2e/**/*.spec.ts` for Playwright.
- `console` is banned in `src/` (use the logger from Phase 4). It's fine in `scripts/` and tests.

## Tool details

- ESLint loads `eslint.config.ts` natively through `--flag unstable_native_nodejs_ts_config`, which is already in the `lint` script. Without the flag, ESLint wants the `jiti` package, which is not allowed.
- Coverage thresholds live in `vitest.config.ts` (PLAN.md §8.3): 85 % lines overall, 95 % for `src/domain` and `src/ingest`. They may only go up.
- Playwright starts the app on port 3100 with a temporary `DB_PATH`, so E2E tests never touch `data/jobboard.db`.
- Prettier skips `PLAN.md` so its tables stay as the owner wrote them.
