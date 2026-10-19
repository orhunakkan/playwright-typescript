# Spec: foundation

Module id: `foundation` · Parent: [SPEC.md](SPEC.md) · Depends on: — · Status: **draft — awaiting approval**

## Objective

Give every later module a working base that matches reality. That means:

- the commands exist
- the configuration selects a target purely from env files
- Playwright projects are split by test type
- lint, format and typecheck gate every change
- visual baselines come from one pinned Linux image
- the docs describe the repo as it actually is

This module adds no tests and no agents.

## Current state

- `package.json` has **no scripts**. CLAUDE.md and README document `npm test`, `npm run lint`
  and an `eslint.config.js`, but none of these exist.
- `dotenv` is a dependency, but nothing imports it. The README's two-pass `ENV` loading isn't in
  `playwright.config.ts`.
- There are 4 projects split by browser. `Desktop Edge` needs a separately installed `msedge`
  channel.
- `fixtures/`, `pages/`, `tests/`, `utilities/` and `.github/workflows/` are empty and untracked.
  There is no `.env.example`, although `.gitignore` and the docs refer to one.

## Decisions

### Environment loading: `config/env.ts`

Use Node's built-in `process.loadEnvFile()` and **remove `dotenv`**. The Jev hook already uses
`loadEnvFile`. Behaviour checked on Node 24.21: it doesn't overwrite variables that are already
set, and it throws `ENOENT` for a missing file.

Load order (first value wins, shell beats everything):

1. the shell environment
2. `.env.<ENV>`, if `ENV` is set
3. `.env`

```ts
// config/env.ts
const loadIfPresent = (file: string) => {
  try {
    process.loadEnvFile(file);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
};

if (process.env['ENV']) loadIfPresent(`.env.${process.env['ENV']}`);
loadIfPresent('.env');

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set. Copy .env.example to .env and fill it in.`);
  return value;
};

export const env = {
  baseUrl: required('BASE_URL'),
  apiUrl: required('API_URL'),
  name: process.env['ENV'] ?? 'default',
} as const;
```

- `ENV=with-bugs npm test` switches to `.env.with-bugs`. This is the pilot's defect-hunting run,
  and it needs no code change.
- `.env.example` is committed, with the Toolshop values and a commented `.env.with-bugs` example.
  I **won't read or edit your `.env`**. You add `BASE_URL` and `API_URL` to it yourself (two lines,
  given in the handoff).

### Playwright projects, split by test type

| Project         | `testDir`      | Device / browser           | Notes                                                                     |
| --------------- | -------------- | -------------------------- | ------------------------------------------------------------------------- |
| `setup`         | `tests/setup`  | Desktop Chrome             | dependency of every browser project; empty until `test-harness`           |
| `chromium`      | `tests/e2e`    | `Desktop Chrome`           |                                                                           |
| `firefox`       | `tests/e2e`    | `Desktop Firefox`          |                                                                           |
| `webkit`        | `tests/e2e`    | `Desktop Safari`           |                                                                           |
| `mobile-chrome` | `tests/e2e`    | `Pixel 8`                  | device name checked in 1.64.1                                             |
| `mobile-safari` | `tests/e2e`    | `iPhone 16`                | device name checked in 1.64.1                                             |
| `api`           | `tests/api`    | none (`request` fixture)   | `baseURL` = `API_URL`                                                     |
| `a11y`          | `tests/a11y`   | `Desktop Chrome`           |                                                                           |
| `perf`          | `tests/perf`   | `Desktop Chrome`           | `workers: 1`, so timings aren't skewed by parallel runs                   |
| `visual`        | `tests/visual` | `Desktop Chrome`, 1280×720 | **registered only when `PW_VISUAL=1`**, which only the Docker script sets |

- `Desktop Edge` is dropped. It would duplicate Chromium coverage and need an extra install.
- **Visual baselines.** Snapshots live at
  `{testDir}/__snapshots__/{testFilePath}/{arg}{ext}`, with no platform suffix, because they are
  only ever produced in `mcr.microsoft.com/playwright:v1.64.1-noble`. Both the tag and Docker 29.8
  (Linux engine) were checked on this machine. This setup keeps a Windows run from producing or
  comparing against baselines that don't match the Docker ones.
- **Reporters:**
  - `list`
  - `html` → `playwright-report/`
  - `json` → `reports/results.json`, outside `outputDir` and the HTML folder, both of which
    Playwright clears on each run. The traceability script reads this file.
- **Unchanged from today:**
  - `fullyParallel`
  - `retries: 1`
  - trace, screenshot and video kept on failure
  - `forbidOnly: !!process.env.CI`

### Scripts

`package.json`. TypeScript scripts run with plain `node` (Node 24 strips types natively), so
there's no `tsx`.

```jsonc
"test": "playwright test",
"test:e2e": "playwright test --project=chromium --project=firefox --project=webkit --project=mobile-chrome --project=mobile-safari",
"test:api": "playwright test --project=api",
"test:a11y": "playwright test --project=a11y",
"test:perf": "playwright test --project=perf",
"test:visual": "node scripts/docker-playwright.ts --project=visual",
"test:visual:update": "node scripts/docker-playwright.ts --project=visual --update-snapshots",
"env:check": "node scripts/env-check.ts",
"lint": "eslint .",
"format": "prettier --write .",
"format:check": "prettier --check .",
"typecheck": "tsc --noEmit"
```

- `scripts/docker-playwright.ts` runs
  `docker run --rm --ipc=host -e PW_VISUAL=1 -e ENV -v <cwd>:/work -w /work mcr.microsoft.com/playwright:v1.64.1-noble npx playwright test <args>`.
  It calls `docker` from Node instead of a shell one-liner, because npm runs scripts through
  `cmd.exe` on Windows. The image tag is read from the installed `@playwright/test` version, so
  it can't drift.
- `scripts/env-check.ts` loads `config/env.ts`, then checks:
  - `BASE_URL` and `API_URL` both answer HTTP 2xx or 3xx
  - Chromium, Firefox and WebKit are installed
  - Docker is reachable (a warning only: it matters only for visual tests)

  Each check prints PASS, FAIL or WARN. The script exits non-zero only on a FAIL.

### Lint, format, typecheck

Dev dependencies, using current versions from the npm registry:

- `eslint` ^10.13
- `@eslint/js` ^10.0
- `typescript-eslint` ^8.71 (its peer range allows TS below 6.1, and we have 6.0.3)
- `eslint-plugin-playwright` ^2.12
- `prettier` ^3.9

`eslint.config.js` sets:

- `typescript-eslint` recommended everywhere
- `playwright.configs['flat/recommended']` scoped to `tests/**`, `fixtures/**` and `pages/**`
  (source: https://github.com/mskelton/eslint-plugin-playwright)
- these rules raised to `error`: `missing-playwright-await`, `no-wait-for-timeout`,
  `no-networkidle`, `no-focused-test`, `no-force-option`, `no-element-handle`,
  `prefer-web-first-assertions`
- `no-skipped-test` as `warn`, because the healer may skip a test, and only after asking first

`.prettierrc.json` keeps what the README documents: 150 columns, single quotes, trailing commas,
LF line endings.

`tsconfig.json` changes:

- add `allowImportingTsExtensions: true` and `erasableSyntaxOnly: true`, so the same files work
  under both `tsc` and native `node`
- keep `.claude/hooks/` excluded, since it has its own tsconfig

### Docs

- **README.md:** rewrite it to match the repo. Keep quick start, configuration and env switching,
  projects table, commands, and troubleshooting. Remove the obsolete Stagecraft and CI-placeholder
  material. It will point to SPEC.md for the STLC design, which later modules fill in.
- **CLAUDE.md:** update commands, layout and conventions to the approved decisions (one test per
  file, AC/TC tags, POMs optional). The Jev section stays word for word.
- Remove the empty `.github/workflows/` directory. CI is deferred.

## Project structure after this module

```
config/env.ts                 typed env, layered .env loading
scripts/env-check.ts          phase-4 preflight
scripts/docker-playwright.ts  run Playwright inside the pinned Linux image
tests/{setup,e2e,api,a11y,perf,visual}/   empty, each with .gitkeep
eslint.config.js  .prettierrc.json  .prettierignore  .env.example
playwright.config.ts  package.json  tsconfig.json  README.md  CLAUDE.md
```

`.gitignore` gains `reports/`.

## Boundaries

- **Always:** keep the Jev hook and its settings untouched; one commit per task below.
- **Ask first:** anything beyond the dependencies listed above.
- **Never:** read, print or write `.env`; add tests or agents (that's later modules' scope).

## Tasks

Each task leaves the repo green under `npm run typecheck && npm run lint`, once task 1 has
landed.

1. **Tooling:** add lint/format/typecheck dependencies and configs, add the scripts, and format
   the existing files. _Verify:_ `npm run lint && npm run format:check && npm run typecheck` exit 0.
2. **Env:** add `config/env.ts` and `.env.example`, remove `dotenv`, add `scripts/env-check.ts`.
   _Verify:_ `npm run env:check` passes against Toolshop once you've added the two lines to
   `.env`. `ENV=nope npm run env:check` fails with the "not set" message only if `.env` also lacks
   the variables.
3. **Projects:** rewrite `playwright.config.ts` with the project table, reporters and snapshot
   template, and add the `tests/*` folders. _Verify:_
   `npx playwright test --list --pass-with-no-tests` exits 0, and
   `PW_VISUAL=1 npx playwright test --list --pass-with-no-tests` also lists `visual`.
4. **Docker visual runner:** add `scripts/docker-playwright.ts`. _Verify:_
   `npm run test:visual -- --pass-with-no-tests` runs inside the container and exits 0.
5. **Docs:** rewrite README.md, update CLAUDE.md, and remove `.github/workflows/`. _Verify:_ every
   command in either doc exists in `package.json` (a script checks this).

## Success criteria

- [ ] Every command in README.md and CLAUDE.md works on a fresh `npm ci`.
- [ ] Changing the target means editing env files only. Proof: `ENV=with-bugs npm run env:check`
      reports the with-bugs hosts, given a `.env.with-bugs`.
- [ ] `dotenv` is gone from `package.json`, and nothing imports it.
- [ ] The visual project never runs outside Docker.
- [ ] Lint, format and typecheck all pass.
