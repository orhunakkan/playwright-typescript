# playwright-typescript

Playwright + TypeScript E2E suite testing [Stagecraft Labs](https://stagecraftlabs.com), a
practice site with 35 independent "labs" (Forms & Validation, Drag & Drop, etc.), each mapped
1:1 to a JIRA story in project `TAB1`. Full depth is in `README.md`; skip there before asking
"how do I run/configure this" — don't re-derive it here.

## Commands

- `npm test` — run the full suite (`playwright test`)
- `npm test -- --project="Desktop Chrome" tests/<lab>/` — one lab, one browser
- `npm run lint` / `npm run format` — eslint / prettier
- `npx playwright show-report` — view the last HTML report
- `npm run load-test:baseline` / `npm run load-test:stress` — Artillery load/stress tests,
  manual-only (no CI workflow). `stress.yml` is **uncapped** (ramps to 300 req/s) and will very
  likely cause real, temporary downtime on the live site while it runs — run deliberately.
  Metrics print to terminal and land in `load-tests/reports/<name>.json`; Artillery's HTML
  `report` command is deprecated upstream, JSON + terminal output is all there is

## Layout

- `tests/<lab>/<lab>.spec.ts` — one spec file per lab
- `pages/<lab>.page.ts` — POM: `readonly` locators + constructor only, no methods, no `goto()`
- `fixtures/index.ts` — registers each POM as a fixture (`<lab>Page`)
- `matchers/` — custom `expect` matchers
- `utilities/accessibility.ts` — `scanWcag()` axe-core helper
- `fixtures/auth/*.json` — per-lab/role `storageState` files
- `skills/` — custom STLC automation skills (see `skills/README.md`)
- `load-tests/configs/*.yml` — Artillery scenarios (`baseline`, `stress`); black-box,
  page-level only, target `https://stagecraftlabs.com` directly (no `BASE_URL`, no API replay —
  see below)

## Conventions

- Lab kebab-name → PascalCase POM class → camelCase `...Page` fixture key → matching file
  paths (e.g. `forms-validation` → `FormsValidationPage` → `formsValidationPage`)
- Spec header comment links the JIRA story: `// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-NN`
- `describe` blocks are grouped per acceptance criterion (`AC-1`, `AC-2`, …); test titles are
  prefixed `positive:` / `negative:` / `boundary:`
- Every spec includes an accessibility `describe` (multi-state `scanWcag` checks) and a
  `@performance`-tagged budget test — a happy-path-only spec is incomplete
- Tests run against the real external site (`BASE_URL` from `.env`), not a local server
- Artillery load tests (`load-tests/`) are a separate concern from the per-lab `@performance`
  Playwright tag: that tag is a single-page-load budget check, Artillery measures
  concurrent-user throughput/stress. Both target production directly, but Artillery configs
  hardcode the URL rather than reading `BASE_URL`, and intentionally stay page-level only (no
  API replay, no auth flow) since this repo has no access to the app's server source

## STLC automation

`skills/*.md` implements a full requirement → POM → spec → CI → JIRA pipeline per lab
(`skills/README.md` has the diagram). If a triaged test failure is a confirmed app defect
(not a test bug), stop the pipeline there — file the bug and hand off to a human instead of
continuing to the next lab.
