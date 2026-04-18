# 🖥️ Playwright — Claude Desktop

> **Source:** [playwright.dev/mcp/clients-claude-desktop](https://playwright.dev/mcp/clients-claude-desktop)

---

## Installation

Follow the **MCP install guide** and add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

---

## Configuration file location

| Platform | Path                                                              |
| -------- | ----------------------------------------------------------------- |
| macOS    | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows  | `%APPDATA%\Claude\claude_desktop_config.json`                     |
