# 🧩 Playwright — Browser Extension

> **Source:** [playwright.dev/mcp/configuration-browser-extension](https://playwright.dev/mcp/configuration-browser-extension)

---

Instead of launching a new browser, connect to one that's already running.

## Connect by channel name

Connect to a running Chrome or Edge by its channel name.

**Navigate to `chrome://inspect/#remote-debugging`** in the target browser and enable **"Allow remote debugging for this browser instance"**.

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--cdp-endpoint=chrome"]
    }
  }
}
```

**Supported channels:** `chrome`, `chrome-beta`, `chrome-dev`, `chrome-canary`, `msedge`, `msedge-beta`, `msedge-dev`, `msedge-canary`.

This is the simplest way to connect — no need to start Chrome with special flags or know the debugging port.

## Connect via CDP endpoint

Connect to any Chromium-based browser with a Chrome DevTools Protocol endpoint:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--cdp-endpoint=http://localhost:9222"]
    }
  }
}
```

Or in the config file:

```json
{
  "browser": {
    "cdpEndpoint": "http://localhost:9222"
  }
}
```

Works with:

- Chrome/Chromium with `--remote-debugging-port`
- Edge
- Electron apps
- Cloud browser services

## Connect via browser extension

The **Playwright Extension** connects to your existing browser tabs, reusing your logged-in sessions, cookies, and installed extensions.

1. **Install the extension** in Chrome or Edge
2. **Configure the MCP server:**

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--extension"]
    }
  }
}
```

## When to use extension mode

- **SSO / 2FA** — skip complex login flows by reusing your authenticated session
- **Browser extensions** — interact with pages that depend on installed extensions
- **Existing tabs** — automate pages you already have open
