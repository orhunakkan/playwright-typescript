# 📋 Playwright — Logger

> **Source:** [playwright.dev/docs/api/class-logger](https://playwright.dev/docs/api/class-logger)

---

## Overview

> **Deprecated:** This class is deprecated. The logs pumped through this class are incomplete. Please use tracing instead.

Playwright generates a lot of logs and they are accessible via the pluggable logger sink.

```ts
const { chromium } = require('playwright'); // Or 'firefox' or 'webkit'.
(async () => {
  const browser = await chromium.launch({
    logger: {
      isEnabled: (name, severity) => name === 'api',
      log: (name, severity, message, args) => console.log(`${name} ${message}`),
    },
  });
  // ...
})();
```

---

## Methods

### `logger.isEnabled(name, severity)` — Added before: v1.9

Determines whether sink is interested in the logger with the given name and severity.

```ts
logger.isEnabled(name, severity);
```

**Arguments:**

| Parameter  | Type                                          | Description     |
| ---------- | --------------------------------------------- | --------------- |
| `name`     | `string`                                      | Logger name.    |
| `severity` | `"verbose" \| "info" \| "warning" \| "error"` | Severity level. |

**Returns:** `boolean`

---

### `logger.log(name, severity, message, args, hints)` — Added before: v1.9

```ts
logger.log(name, severity, message, args, hints);
```

**Arguments:**

| Parameter     | Type                                          | Description                      |
| ------------- | --------------------------------------------- | -------------------------------- |
| `name`        | `string`                                      | Logger name.                     |
| `severity`    | `"verbose" \| "info" \| "warning" \| "error"` | Severity level.                  |
| `message`     | `string \| Error`                             | Log message format.              |
| `args`        | `Array<Object>`                               | Message arguments.               |
| `hints.color` | `string` (optional)                           | Optional preferred logger color. |

**Returns:** `void`
