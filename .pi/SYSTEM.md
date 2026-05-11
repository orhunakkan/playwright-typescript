# Agent Ground Rules

These rules apply to work in this repository. Read them before changing files.

---

## Current Scope

This repo is currently a lean Playwright TypeScript docs-monitoring framework.

Active areas:

- `tests/scrapper/playwright-docs-link-monitoring.spec.ts`
- `docs/api/`
- `docs/guides/`
- `docs/mcp/`
- `docs/agent-cli/`
- `fixtures/playwright-docs-links/sidebar-links.json`
- `fixtures/reference-snapshots/`

Do not rely on removed framework layers or old templates. If a folder is empty, treat it as a placeholder until real source files are added.

---

## TypeScript

- Keep TypeScript strict.
- Do not use `any`.
- Prefer Playwright, Node, and explicit local types.
- Use `as const` when a literal array or object should stay narrow.
- Source test files should remain `.ts`; do not add `.js` test helpers unless the project intentionally adopts them.

---

## Playwright Tests

- Current specs import `test` and `expect` directly from `@playwright/test`.
- Prefer user-facing locators and contracts:
  1. `getByRole`
  2. `getByLabel`
  3. `getByPlaceholder`
  4. `getByText`
  5. `getByTestId`
  6. CSS only when the page has no reliable accessible contract
- Prefer web-first assertions such as `toBeVisible`, `toHaveText`, and `toHaveURL`.
- Keep tests isolated and repeatable.
- Use `test.describe.configure({ mode: 'serial' })` only if state sharing is intentional and documented.
- Avoid arbitrary waits in new code; if a delay is needed for live-site politeness, document why.

---

## Docs Monitoring

Normal run command:

```bash
npx playwright test tests/scrapper/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome"
```

The configured Firefox project also collects the tests, but the spec skips non-`Desktop Chrome` runs. Target `Desktop Chrome` for normal verification.

For content drift:

1. Inspect the failure diff or `content-diff.txt`.
2. Confirm the live docs change is real.
3. Update the matching local markdown file under `docs/`.
4. Accept only the focused affected text snapshot with `--update-snapshots`.
5. Rerun without `--update-snapshots`.

For sidebar drift:

1. Update only the relevant source page entry in `fixtures/playwright-docs-links/sidebar-links.json`.
2. Keep the order aligned with the live sidebar where practical.
3. Remove stale snapshots only for URLs no longer present in any stored sidebar list.

Never fix transient navigation, timeout, bot-protection, or partial-load failures by changing docs or snapshots.

---

## Documentation Lookup

Use the local docs tree first:

- API method/class questions: `docs/api/`
- Feature/how-to questions: `docs/guides/`
- MCP questions: `docs/mcp/`
- Agent CLI questions: `docs/agent-cli/`

Use `.pi/skills/find-in-docs/SKILL.md` to locate likely local files. For latest public behavior, verify against official Playwright docs.

---

## Removed Guidance

Do not reference or recreate these old layers unless the user explicitly asks to restore them:

- Typed environment wrapper files.
- Custom page fixtures.
- Required report annotations.
- Image visual snapshot scripts.
- API payload/schema helper layers.
- Third-party demo auth flows.
- Load testing scripts.
- Database test infrastructure.
- Old npm test scripts.

---

## Before Declaring Work Done

For `.pi` guidance changes:

```bash
npx prettier --check .pi
rg "<stale path or term>" .pi
```

For Playwright command validation:

```bash
npx playwright --version
npx playwright test --list
```

For docs-monitoring behavior changes:

```bash
npx playwright test tests/scrapper/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome"
```
