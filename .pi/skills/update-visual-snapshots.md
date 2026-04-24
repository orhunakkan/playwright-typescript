# Skill: Update Visual Regression Snapshots

Visual regression tests compare live browser screenshots pixel-by-pixel against committed baseline images. This skill covers when it is safe to update baselines and exactly how to do it.

---

## Where Baselines Live

```
fixtures/reference-snapshots/
└── visual-regression.spec.ts/
    └── <test name>/
        ├── Desktop Chrome-<page-slug>-snap.png
        ├── Desktop Firefox-<page-slug>-snap.png
        └── ...
```

This path is controlled by `snapshotPathTemplate` in `playwright.config.ts`:

```
fixtures/reference-snapshots/{testFileName}/{testName}/{projectName}-{arg}{ext}
```

Baseline files are **committed to git** — they are the source of truth for what each page should look like.

---

## Why Docker Is Mandatory

Visual comparisons are pixel-perfect. Fonts, anti-aliasing, and sub-pixel rendering differ between:

- macOS vs Linux
- Different GPU drivers
- Different display scaling factors

The Docker image used by both the npm scripts and CI is:

```
mcr.microsoft.com/playwright:v1.59.1-noble
```

Running `npx playwright test visual-regression.spec.ts` outside Docker on a Mac or Windows machine will produce snapshots that **will always fail on CI**, even if the UI is correct.

> ⚠️ Never run `visual-regression.spec.ts` directly with `npx playwright test`. Always use the npm scripts.

---

## When to Update Baselines

Only update when **all of the following are true:**

- [ ] A UI change was intentionally made (layout, colour, font, component change)
- [ ] The change has been reviewed and approved by a human
- [ ] The current baseline failure is caused by the intentional change — not by a test environment problem or a real regression

**Do not update** if:

- A test failed on CI but passes locally — this signals an environment mismatch, not a valid change
- Multiple unrelated pages suddenly differ — this likely signals a global style change that needs investigation first
- The cause of the diff is unknown

---

## Step-by-Step: Update Baselines

### Step 1 — Confirm the UI change is intentional

Review the diff in the Playwright HTML report or the `test-results/` failure screenshots before proceeding.

### Step 2 — Run the update command in Docker

```bash
npm run test:visual:update
```

This runs:

```bash
docker run --rm -v .:/work -w /work -e TEST_ENV=dev \
  mcr.microsoft.com/playwright:v1.59.1-noble \
  npx playwright test tests/e2e/visual-regression.spec.ts --update-snapshots
```

Wait for the Docker container to finish. It will overwrite the affected PNG files in `fixtures/reference-snapshots/`.

### Step 3 — Review the diff

```bash
# See which snapshot files were changed
git diff --stat fixtures/reference-snapshots/

# See the full list of modified files
git status fixtures/reference-snapshots/
```

Inspect each changed file. Use a visual git diff tool (e.g., VS Code's Source Control panel) to see the before/after image.

### Step 4 — Stage only the relevant changes

If only one page changed intentionally, stage only that page's snapshots:

```bash
git add fixtures/reference-snapshots/visual-regression.spec.ts/<test-name>/
```

Do **not** blindly stage all changes with `git add .` if some diffs are unexpected.

### Step 5 — Verify the updated baselines pass

Run the comparison (not the update) to confirm the new baselines match the current render:

```bash
npm run test:visual
```

All tests should pass with zero pixel differences.

### Step 6 — Commit

```bash
git commit -m "chore: update visual baselines for <page name> after <change description>"
```

---

## Adding a New Page to Visual Regression

To include a new page in the visual regression sweep, add its URL slug to the `pages` array at the top of `tests/e2e/visual-regression.spec.ts`:

```ts
const pages = [
  'web-form',
  'index',
  // ... existing entries ...
  '<new-page-slug>', // ← add here
];
```

Then generate the initial baseline:

```bash
npm run test:visual:update
```

Commit the new PNG files along with the spec change.

---

## Troubleshooting

| Symptom                                                  | Likely cause                                 | Fix                                                                               |
| -------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| All pages fail after a seemingly unrelated change        | A global CSS/font change affected everything | Review the change, update all baselines if intentional                            |
| Passes locally, fails on CI                              | Snapshots were generated outside Docker      | Regenerate with `npm run test:visual:update`                                      |
| Docker command hangs                                     | Docker Desktop not running                   | Start Docker Desktop first                                                        |
| `--update-snapshots` flag produces no new files          | `snapshotPathTemplate` mismatch              | Verify `playwright.config.ts` `snapshotPathTemplate` matches the folder structure |
| New baseline PNG is committed but test still fails on CI | Image was generated on wrong OS              | Delete the PNG and regenerate via Docker                                          |
