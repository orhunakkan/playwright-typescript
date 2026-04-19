# 🎓 Playwright — Skills

> **Source:** [playwright.dev/agent-cli/skills](https://playwright.dev/agent-cli/skills)

---

## Overview

Skills teach coding agents how to use `playwright-cli` effectively, providing structured reference documentation that agents can discover and use.

## Installing skills

```bash
playwright-cli install --skills
```

This installs skill files locally so your coding agent can reference them for context about available commands and workflows.

## What skills provide

The installed skill includes detailed reference guides for common tasks:

- **Running and Debugging Playwright tests** — run, debug and manage Playwright test suites
- **Request mocking** — intercept and mock network requests
- **Running Playwright code** — execute arbitrary Playwright scripts
- **Browser session management** — manage multiple browser sessions
- **Storage state (cookies, localStorage)** — persist and restore browser state
- **Test generation** — generate Playwright tests from interactions
- **Tracing** — record and inspect execution traces
- **Video recording** — capture browser session videos
- **Inspecting element attributes** — get element attributes not visible in snapshots

## Skills-less operation

You can use `playwright-cli` without installing skills. Point your agent at the CLI and let it discover commands:

```
Test the "add todo" flow on https://demo.playwright.dev/todomvc using playwright-cli.
Check playwright-cli --help for available commands.
```

## Supported agents

Skills work with:

- **Claude Code**
- **GitHub Copilot**
- **Cursor**
- Any coding agent that supports locally installed skills

---

## 🗂️ Quick Reference

| What               | How                                    |
| ------------------ | -------------------------------------- |
| Install skills     | `playwright-cli install --skills`      |
| Use without skills | Point agent to `playwright-cli --help` |
| Supported agents   | Claude Code, GitHub Copilot, Cursor    |
