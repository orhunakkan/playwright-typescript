---
name: playwright-locator-mapper
description: >
  Automatically maps all clickable, actionable, and validateable Playwright locators for any web page
  in an application. Use this skill whenever the user wants to: audit a page's interactive elements,
  generate a Page Object Model, extract locators from a URL, discover all buttons/inputs/links on a page,
  map form validation constraints, or build a locator inventory for test automation. Also trigger when
  the user says things like "map my locators", "find all elements on this page", "generate a POM",
  "locator audit", or "what can I interact with on this page". Always use this skill when Playwright MCP,
  Playwright CLI, or Chrome DevTools MCP are available and the user wants to work with web page elements.

compatibility: 'Requires Playwright MCP (navigation, snapshots, accessibility tree) and Chrome DevTools MCP (event listener inspection, DOM queries). Optional: Playwright CLI for running generated test scaffolds. Output: TypeScript (.ts) or JavaScript (.js) Page Object Model file.'
---

# Playwright Locator Mapper

Maps every clickable, actionable, and validateable element on a web page and produces a typed
Page Object Model (POM) file importable into any Playwright test suite.

---

## ⛔ Guardrail — Full URL Required

**This is the first check. Run it before anything else. Do not skip it.**

Scan the user's prompt for a full URL. A valid URL must:

- Start with `http://` or `https://`
- Include a hostname (e.g. `localhost`, `myapp.com`, `staging.example.com`)
- Examples of valid URLs: `https://myapp.com/login`, `http://localhost:3000/checkout`

**If no valid full URL is found in the prompt → STOP. Do not execute any phase.**

Respond with exactly this message (substitute the page name if the user mentioned one, otherwise use "the target page"):

> ⛔ A full URL is required to run the locator mapper.
> Please provide the complete URL for [the target page], including the protocol — for example:
> `https://your-app.com/page-path`

Do **not** guess, infer, or construct a URL from partial information. Do **not** proceed even if the user describes the page clearly. The full URL must be explicit in the prompt.

Once the user replies with a valid URL, proceed from Phase 1.

---

## ⛔ Guardrail — Required Tools Must Be Available

**This is the second check. Run it after the URL guardrail passes. Do not skip it.**

Before executing any phase, verify that **all three** of the following tools are available and accessible in the current session:

| Tool                    | Used For                                                      |
| ----------------------- | ------------------------------------------------------------- |
| **Playwright MCP**      | Browser navigation, screenshots, accessibility tree snapshots |
| **Playwright CLI**      | Executing generated test scaffolds and recorded flows         |
| **Chrome DevTools MCP** | DOM queries, event listener inspection, computed style checks |

**How to check:** Look at the tools listed in your current context. All three must be present and connected — not just named or referenced by the user.

**If any one of the three tools is missing or unavailable → STOP. Do not execute any phase.**

Respond with exactly this message, listing only the missing tool(s):

> ⛔ This skill requires the following tools to be connected, but they are not available in this session:
>
> - [missing tool name(s)]
>
> Please connect them and retry. All three are required:
>
> - **Playwright MCP** — for browser navigation and accessibility snapshots
> - **Playwright CLI** — for executing Playwright test scripts
> - **Chrome DevTools MCP** — for DOM and event listener inspection

Do **not** attempt to substitute or work around a missing tool (e.g. do not replace Chrome DevTools MCP with raw JS evaluation alone, and do not skip the CLI check). All three must be confirmed before any phase runs.

---

## When You're Invoked

Both guardrails have passed: a full URL is present and all three required tools are available.
The user wants a locator map for one or more pages. For bulk mode (multiple URLs provided),
run Phases 1–4 for each URL sequentially — the URL guardrail applies to every URL in the list,
but the tools check only needs to pass once per session.

---

## Phase 1 — Navigate & Snapshot

Use **Playwright MCP** to:

1. Open the target URL in a browser context
2. Wait for `networkidle` or `domcontentloaded` (ask user if the page has heavy lazy-loading)
3. Take a **screenshot** — gives visual context for naming locators
4. Capture the **accessibility tree snapshot** — the ground truth for role-based locators

```
// Playwright MCP prompt pattern
navigate to <URL>
take screenshot
get accessibility snapshot
```

If the page requires **authentication**, ask the user for:

- Credentials to type in, or
- A saved auth state file path (`storageState`), or
- Whether to record a login flow first

---

## Phase 2 — DOM Interrogation

Use **Chrome DevTools MCP** (or Playwright `page.evaluate()`) to query:

### 2a. Interactive Element Classes

Run these selectors to enumerate all actionable nodes:

| Class               | Selector                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| Buttons             | `button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]`           |
| Links               | `a[href], [role="link"]`                                                                             |
| Text inputs         | `input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="hidden"]), textarea` |
| Selects / dropdowns | `select, [role="listbox"], [role="combobox"]`                                                        |
| Checkboxes & radios | `input[type="checkbox"], input[type="radio"], [role="checkbox"], [role="radio"]`                     |
| Toggles / switches  | `[role="switch"]`                                                                                    |
| Dialogs / modals    | `[role="dialog"], [role="alertdialog"]`                                                              |
| Tabs                | `[role="tab"], [role="tablist"]`                                                                     |
| Custom interactive  | `[tabindex]:not([tabindex="-1"]), [onclick], [data-action], [data-testid]`                           |

### 2b. Validation Constraints

For every `input`, `textarea`, and `select`, extract:

```js
{
  required: el.required,
  type: el.type,
  min: el.min, max: el.max,
  minLength: el.minLength, maxLength: el.maxLength,
  pattern: el.pattern,
  step: el.step,
  ariaRequired: el.getAttribute('aria-required'),
}
```

### 2c. Event Listener Detection (Chrome DevTools MCP)

Use DevTools to check for JS-attached handlers on elements that don't have semantic HTML roles — these are "hidden" interactive elements. Look for:

- `click`, `keydown`, `keypress`, `pointerdown` listeners
- Elements with `cursor: pointer` in computed styles but no native role

---

## Phase 3 — Locator Strategy Assignment

For each element discovered, generate locators using Playwright's **recommended priority order**:

```
1. getByRole()        ← best: semantic, resilient to DOM changes
2. getByLabel()       ← for form inputs with <label>
3. getByPlaceholder() ← for inputs without labels
4. getByTestId()      ← if data-testid / data-cy / data-qa present
5. getByText()        ← for buttons/links with visible text
6. getByAltText()     ← for images
7. getByTitle()       ← for elements with title attribute
8. locator(css)       ← CSS fallback (flag as fragile with a comment)
```

**Naming convention** for the POM object keys:

- Use camelCase descriptive names: `submitButton`, `emailInput`, `passwordError`
- Suffix by type: `*Button`, `*Input`, `*Link`, `*Dropdown`, `*Checkbox`, `*Error`, `*Modal`
- If a test ID exists, prefer it as the variable name source

---

## Phase 4 — Output Generation

Produce a **TypeScript locator file** using exactly this structure. The file contains only:

- `readonly` locator property declarations grouped by element type
- A `constructor(page: Page)` that assigns each locator

**No functions. No methods. No helpers. No `goto()`. No `static` blocks. No extra logic of any kind.**
This file is a locator registry only — behaviour belongs in the test files that consume it.

```typescript
// <PageName>Page.ts
// Auto-generated by playwright-locator-mapper
// URL: <url>  |  Generated: <date>

import { Page, Locator } from '@playwright/test';

export class <PageName>Page {
  // ── Inputs ──────────────────────────────────────────────
  readonly <inputName>: Locator;

  // ── Buttons ─────────────────────────────────────────────
  readonly <buttonName>: Locator;

  // ── Links ───────────────────────────────────────────────
  readonly <linkName>: Locator;

  // ── Dropdowns ───────────────────────────────────────────
  readonly <dropdownName>: Locator;

  // ── Checkboxes & Radios ──────────────────────────────────
  readonly <checkboxName>: Locator;

  // ── Validation Messages ──────────────────────────────────
  readonly <errorName>: Locator;

  constructor(page: Page) {
    // ── Inputs ────────────────────────────────────────────
    this.<inputName> = page.getByLabel('<label text>');

    // ── Buttons ───────────────────────────────────────────
    this.<buttonName> = page.getByRole('button', { name: '<name>' });

    // ── Links ─────────────────────────────────────────────
    this.<linkName> = page.getByRole('link', { name: '<name>' });

    // ── Dropdowns ─────────────────────────────────────────
    this.<dropdownName> = page.getByRole('combobox', { name: '<name>' });

    // ── Checkboxes & Radios ───────────────────────────────
    this.<checkboxName> = page.getByRole('checkbox', { name: '<name>' });

    // ── Validation Messages ───────────────────────────────
    this.<errorName> = page.getByRole('alert').filter({ hasText: '<text>' });
  }
}
```

**Rules for the output file:**

- Only `readonly` property declarations and constructor assignments — nothing else
- No `page: Page` property stored on the class (it is only used locally in the constructor)
- No methods, async functions, navigation helpers, or utility wrappers
- No `static` members of any kind
- Omit any element-type section entirely if no elements of that type were found on the page
- Each group must have a comment header matching its element type

---

## Phase 5 — Audit Report (Optional but Recommended)

After generating the locator file, produce a short audit summary in the conversation:

```
✅ Page: <PageName> (<url>)
   ├─ 4 inputs
   ├─ 3 buttons
   ├─ 6 links
   ├─ 2 dropdowns
   └─ 1 modal trigger

⚠️  Flagged:
   - 2 elements use CSS-only locators (fragile) — missing labels/roles
   - 1 custom click handler on <div.card-item> — no ARIA role
   - "Submit" button has a duplicate: found 2 buttons with name "Submit"
```

Flags to always surface:

- **Duplicate locators** — two elements match the same selector
- **CSS-only fallbacks** — brittle, suggest adding `data-testid` to the element
- **Invisible interactives** — `pointer-events: none`, `disabled`, `aria-hidden="true"` but with click listeners
- **Missing labels** — inputs with no `<label>`, `aria-label`, or `placeholder`

---

## Multi-Page / Bulk Mode

If the user wants to map **multiple pages**, iterate through each URL and:

1. Run Phases 1–4 for each URL sequentially
2. Name each file `<PageName>Page.ts` in a `pages/` directory
3. Generate a barrel file `index.ts` that re-exports all locator files

```typescript
// pages/index.ts
export { LoginPage } from './LoginPage';
export { DashboardPage } from './DashboardPage';
export { CheckoutPage } from './CheckoutPage';
```

Ask the user upfront if they want bulk mode or single-page mode.

---

## Edge Cases

| Situation                                     | Handling                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| Page behind auth                              | Ask for credentials or `storageState` path before starting                       |
| SPA with client-side routing                  | Navigate to each route URL directly; confirm all routes load correctly           |
| Shadow DOM components                         | Use Playwright's `locator('>> css=selector')` pierce syntax; flag in audit       |
| Lazy-loaded content (infinite scroll, modals) | Ask user to describe trigger actions; scroll/click to reveal before snapshotting |
| iframes                                       | Identify iframe src; use `frameLocator()` wrapper; note in POM                   |
| Dynamic text (user name, dates)               | Use regex matchers: `getByRole('heading', { name: /Welcome/ })`                  |
| Duplicate "Submit" buttons                    | Scope with `.filter()` or parent `locator()` chain                               |
| Elements only visible on hover                | Note in audit; user must decide whether to include                               |

---

## Quick-Start Prompt Template

When a user gives you a URL and asks to map it, open with this internal plan:

```
1. Navigate to <URL> via Playwright MCP
2. Screenshot + accessibility snapshot
3. Chrome DevTools MCP: query all interactive selectors
4. Chrome DevTools MCP: extract validation constraints (for audit flags only — not written to the locator file)
5. Chrome DevTools MCP: check event listeners on non-semantic elements
6. Build locator priority ranking for each element
7. Generate <PageName>Page.ts
8. Print audit summary with flags
```

Always show the audit summary in the chat and attach the generated `.ts` file for download.
