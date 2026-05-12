# Project: Playwright Docs Monitoring Framework

## Overview

This repository is currently a lean **Playwright + TypeScript** framework focused on monitoring the public Playwright documentation site.

The active suite:

- Reads documentation URLs from `fixtures/playwright-docs-links/sidebar-links.json`.
- Visits live Playwright documentation pages.
- Compares normalized article text against text snapshots in `fixtures/reference-snapshots/`.
- Uses local markdown docs under `docs/` as the versioned copy agents should update when live docs changes are accepted.

Do not use old guidance for removed framework layers unless those layers are intentionally restored first.

---

## Current Repo Shape

```text
.
├── docs/
│   ├── agent-cli/                   # Local Playwright Agent CLI docs
│   ├── api/                         # Local Playwright API docs
│   ├── guides/                      # Local Playwright guide docs
│   └── mcp/                         # Local Playwright MCP docs
├── fixtures/
│   ├── playwright-docs-links/
│   │   └── sidebar-links.json       # Playwright docs URL source list
│   └── reference-snapshots/         # Text snapshots for docs monitoring
├── tests/
│   └── scrapper/
│       └── playwright-docs.spec.ts
├── playwright.config.ts
├── tsconfig.json
├── eslint.config.js
└── package.json
```

`pages/` and `utilities/` currently exist but are empty. Treat them as placeholders, not active framework contracts.

---

## Current Tooling Facts

Verified locally on 2026-05-11:

| Item               | Current value                      |
| ------------------ | ---------------------------------- |
| `pi`               | `0.74.0`                           |
| `@playwright/test` | `1.59.1`                           |
| npm scripts        | `format`, `test:scrapper`          |
| test collection    | 374 collected tests in 1 spec file |

Use direct `npx playwright ...` commands when a focused command or extra flags are needed. `npm run test:scrapper` is available for the current full Desktop Chrome scraper run with `--workers=1`.

---

## Playwright Configuration

Defined in `playwright.config.ts`:

- `testDir: './tests'`
- `snapshotDir: './fixtures/reference-snapshots'`
- `snapshotPathTemplate: '{snapshotDir}/{testFileName}/{arg}{ext}'`
- `fullyParallel: true`
- `forbidOnly: !!process.env.CI`
- `retries: process.env.CI ? 2 : 0`
- `workers: process.env.CI ? 1 : undefined`
- `reporter: 'html'`
- `use.trace: 'on-first-retry'`
- Projects:
  - `Desktop Chrome` using `devices['Desktop Chrome']`
  - `Desktop Firefox` using `devices['Desktop Firefox']`

The docs-snapshot specs skip every non-`Desktop Chrome` run in `beforeEach`. Normal focused Playwright-docs runs should target:

```bash
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome"
```

Broad `npx playwright test` also collects Firefox-project copies, but those tests are skipped at runtime by the specs.

---

## Active Test Behavior

The active specs are:

```text
tests/scrapper/playwright-docs.spec.ts
```

They run page content snapshot checks:

- Visit each unique URL from the matching `fixtures/*-docs-links/sidebar-links.json` file.
- Extract and normalize the main documentation text.
- Compare the result to text snapshots.

On failures, the specs can generate `JS-DOCS-CHECK.md`, `PW-DOCS-CHECK.md`, or `TS-DOCS-CHECK.md` at the repo root with a markdown table summarizing failed checks.

---

## Documentation Workflow

Use local docs first:

| Question type                    | Local path                         |
| -------------------------------- | ---------------------------------- |
| Playwright API method/class      | `docs/api/`                        |
| Playwright feature/how-to guide  | `docs/guides/`                     |
| Playwright MCP behavior          | `docs/mcp/`                        |
| Playwright Agent CLI behavior    | `docs/agent-cli/`                  |
| Finding the right local doc file | `.pi/skills/find-in-docs/SKILL.md` |

When the task depends on the latest public Playwright behavior, compare local docs with official Playwright docs:

- https://playwright.dev/docs/test-configuration
- https://playwright.dev/docs/best-practices
- https://playwright.dev/docs/test-agents
- https://playwright.dev/docs/test-cli

Apply accepted live documentation changes in this order:

1. Confirm the live page change is real and not a transient network, bot-protection, or partial-load issue.
2. Update the relevant local markdown file under `docs/`.
3. Update the relevant `fixtures/*-docs-links/sidebar-links.json` file only for confirmed URL list changes.
4. Accept only the focused affected text snapshot.
5. Rerun the focused command and then the full `Desktop Chrome` docs-snapshot command.

---

## Coding Conventions

- Keep TypeScript strict.
- Do not introduce `any`; use Playwright and Node types or define a narrow interface.
- Keep docs-snapshot specs importing `test` and `expect` from `@playwright/test`.
- Prefer Playwright locators and web-first assertions:
  - `getByRole`
  - `getByLabel`
  - `getByPlaceholder`
  - `getByText`
  - `getByTestId` when there is a stable test id contract
- Avoid fixed sleeps for new test logic unless rate limiting or live-docs politeness requires it.
- Keep tests isolated and deterministic where possible.
- Do not blindly accept snapshots; inspect the diff first.

---

## Verification Commands

Use these from the repository root:

```bash
npx playwright --version
npx playwright test --list
npx playwright test tests/scrapper --project="Desktop Chrome"
npx playwright show-report
```

Useful focused commands:

```bash
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --grep "<failed title or slug>"
npx playwright test tests/scrapper/playwright-docs.spec.ts --project="Desktop Chrome" --grep "<failed title or slug>" --update-snapshots
```
