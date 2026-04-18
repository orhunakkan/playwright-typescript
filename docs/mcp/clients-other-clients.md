# 🔌 Playwright — Other Clients

> **Source:** [playwright.dev/mcp/clients-other-clients](https://playwright.dev/mcp/clients-other-clients)

---

The standard configuration works with most MCP clients. Consult your client's MCP documentation for where to place the config.

---

## Cline

Follow the **Configuring MCP Servers** guide. Add to your `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "timeout": 30,
      "args": ["-y", "@playwright/mcp@latest"],
      "disabled": false
    }
  }
}
```

---

## Codex

```bash
codex mcp add playwright npx "@playwright/mcp@latest"
```

Or add to `~/.codex/config.toml`:

```toml
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

---

## Copilot CLI

```bash
/mcp add
```

Or add to `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "type": "local",
      "command": "npx",
      "tools": ["*"],
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

---

## Goose

Go to **Advanced settings → Extensions → Add custom extension**.

Use type **STDIO** and set the command to `npx @playwright/mcp`.

---

## Kiro

Add to `.kiro/settings/mcp.json`:

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

## Gemini CLI

Follow the **MCP install guide** and use the standard config.

---

## opencode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp@latest"],
      "enabled": true
    }
  }
}
```

---

## 🗂️ Quick Reference

| Client      | Config Location                    |
| ----------- | ---------------------------------- |
| Cline       | `cline_mcp_settings.json`          |
| Codex       | `~/.codex/config.toml`             |
| Copilot CLI | `~/.copilot/mcp-config.json`       |
| Goose       | Advanced settings → Extensions     |
| Kiro        | `.kiro/settings/mcp.json`          |
| Gemini CLI  | MCP install guide                  |
| opencode    | `~/.config/opencode/opencode.json` |
