# 📋 Playwright — Snapshots

> **Source:** [playwright.dev/mcp/snapshots](https://playwright.dev/mcp/snapshots)

---

Playwright MCP uses **accessibility snapshots** instead of screenshots. Every tool that interacts with the page returns a structured tree of accessible elements with **refs** for interaction.

## Snapshot format

```bash
- heading "todos" [level=1]
- textbox "What needs to be done?" [ref=e5]
- listitem:
  - checkbox "Toggle Todo" [ref=e10]
  - text: "Buy groceries"
- listitem:
  - checkbox "Toggle Todo" [ref=e14]
  - text: "Water flowers"
- contentinfo:
  - text: "2 items left"
  - link "All" [ref=e20]
  - link "Active" [ref=e21]
  - link "Completed" [ref=e22]
```

Each interactive element gets a unique **ref** (e.g., `ref=e5`). The LLM uses these refs to interact:

```bash
browser_type { ref: "e5", text: "headphones" } → type into search
browser_click { ref: "e10" } → check the checkbox
browser_click { ref: "e20" } → click the "All" link
```

## Element refs

Refs are **stable within a single snapshot** — the same element always has the same ref until the page changes. After navigation or DOM updates, the tool returns a fresh snapshot with new refs.

| Property   | Detail                                                            |
| ---------- | ----------------------------------------------------------------- |
| Format     | `e` followed by a number (e.g., `e1`, `e15`, `e203`)              |
| Scope      | Unique within a single snapshot                                   |
| Lifetime   | Valid until the next page change                                  |
| Assignment | Only interactive elements get refs (buttons, links, inputs, etc.) |

## On-demand snapshots

Use `browser_snapshot` to capture the page state on demand. Most tools also return a snapshot automatically after each action, so the LLM always has up-to-date page state.

## Snapshots with screenshots

For pages where visual context matters (canvas apps, charts, image-heavy layouts), combine snapshots with screenshots:

**Take a snapshot and a screenshot of the current page.** The LLM gets both the structured accessibility tree for interaction and the visual screenshot for understanding layout.

See **Vision Mode** for coordinate-based interaction using screenshots.

## Why snapshots over screenshots

| Feature      | Snapshots                                         | Screenshots                                 |
| ------------ | ------------------------------------------------- | ------------------------------------------- |
| Token cost   | ~200-400 tokens                                   | ~3000-5000 tokens (vision model)            |
| Precision    | Exact — refs point to specific elements           | Approximate — requires coordinate guessing  |
| Speed        | Instant — text parsing                            | Slower — vision model inference             |
| Reliability  | Deterministic — same structure = same interaction | Variable — layout changes break coordinates |
| Vision model | Not required                                      | Required                                    |

## Best practices

- **Use refs, not selectors** — refs from snapshots are more reliable than CSS selectors because they point to the exact element the LLM just saw
- **Re-snapshot after navigation** — refs are invalidated when the page changes
- **Combine with screenshots** — when visual context is needed alongside structured data
- **Check for dialogs** — if a tool reports a dialog is open, handle it before proceeding with other actions
