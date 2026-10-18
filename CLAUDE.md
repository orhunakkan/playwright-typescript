# playwright-typescript

Playwright + TypeScript E2E framework that runs against a live site set by `BASE_URL`. The
previous target (Stagecraft Labs) was retired and its specs, POMs and fixtures were removed;
`tests/` and `pages/` are empty until the new target app's base URL is known. Full depth is in
`README.md`; read it before asking "how do I run/configure this" — don't re-derive it here.

## Commands

- `npm test` — run the full suite (`playwright test`)
- `npm test -- --project="Desktop Chrome" tests/<area>/` — one area, one browser
- `npm run lint` / `npm run format` — eslint / prettier
- `npx playwright show-report` — view the last HTML report

## Layout

- `tests/<area>/<area>.spec.ts` — one spec file per feature area
- `pages/<area>.page.ts` — POM: `readonly` locators + constructor only, no methods, no `goto()`
- `fixtures/index.ts` — registers each POM as a fixture (`<area>Page`)
- `utilities/accessibility.ts` — `scanWcag()` axe-core helper

## Conventions

- Kebab-name → PascalCase POM class → camelCase `...Page` fixture key → matching file paths
  (e.g. `login` → `LoginPage` → `loginPage`)
- `describe` blocks are grouped per acceptance criterion (`AC-1`, `AC-2`, …); test titles are
  prefixed `positive:` / `negative:` / `boundary:`
- Every spec includes an accessibility `describe` (multi-state `scanWcag` checks) and a
  `@performance`-tagged budget test — a happy-path-only spec is incomplete
- Tests run against the real external site (`BASE_URL` from `.env`), not a local server
- CI ([.github/workflows/playwright.yml](.github/workflows/playwright.yml)) is a manual-dispatch
  placeholder while `tests/` is empty — restore triggers, browser matrix and `vars.BASE_URL` once
  specs exist

## Jev skill routing

Jev is TypeSafe's "System One" model. It returns typed answers with probabilities (Choice, Score, Noul), not text.

**Following the routing:**

- **Every prompt goes through Jev first.** A `UserPromptSubmit` hook ([.claude/settings.json](.claude/settings.json) → [.claude/hooks/jev-skill-router.mts](.claude/hooks/jev-skill-router.mts)) asks Jev which agent-skills skills fit the prompt. The answer arrives as a `<jev_skill_routing>` block.
- **Jev's picks are binding.** Load exactly the listed skills with the Skill tool before starting, and follow them. Don't load other agent-skills skills unless the user asks. If the block says no skill fits, load none.
- **If routing is skipped or failed, tell the user.** The hook reports this in its status message. Don't quietly pick skills yourself.
- **Slash commands are not routed.** Prompts starting with `/` already name what to run.

**Tuning:**

- **The settings live at the top of the router script:** `THRESHOLD` (0.5), `MAX_PICKS` (3) and `EXCLUDED_SKILLS`. `using-agent-skills` is excluded because Jev replaces it.
- **Base changes on the log.** Every decision, with all probabilities, is logged to `.claude/jev-routing.log`, which is git-ignored. Check it before changing any setting.

**Calling Jev from code:**

- **SDK:** `@typesafe-ai/sdk` 0.7.0 (requires Node 22+). Read the live docs before writing Jev code, starting at https://docs.typesafe.ai/llms.txt.
- **The API key stays in `.env` as `TYPESAFE_API_KEY`.** `.env` is git-ignored, and `.env.example` is its template.
- **Never read, print or commit `.env`.**
- **Keep the key server-side.** Never set the SDK's `dangerouslyAllowBrowser` option.
