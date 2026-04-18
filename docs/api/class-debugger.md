# 📦 Playwright — Debugger

> **Source:** [playwright.dev/docs/api/class-debugger](https://playwright.dev/docs/api/class-debugger)

---

API for controlling the Playwright debugger. The debugger allows pausing script execution and inspecting the page. Obtain the debugger instance via `browserContext.debugger`.

---

## Methods

### next

**Added in:** v1.59

Resumes script execution and pauses again before the next action. Throws if the debugger is not paused.

```ts
await debugger.next();
```

**Returns:** `Promise<void>`

---

### pausedDetails

**Added in:** v1.59

Returns details about the currently paused call. Returns `null` if the debugger is not paused.

```ts
debugger.pausedDetails();
```

**Returns:** `null | Object`

- `location` Object
  - `file` string
  - `line` number (optional)
  - `column` number (optional)
- `title` string

---

### requestPause

**Added in:** v1.59

Configures the debugger to pause before the next action is executed. Throws if the debugger is already paused. Use `debugger.next()` or `debugger.runTo()` to step while paused.

> **Note:** `page.pause()` is equivalent to a "debugger" statement — it pauses execution at the call site immediately. `debugger.requestPause()` is equivalent to "pause on next statement" — it configures the debugger to pause before the next action is executed.

```ts
await debugger.requestPause();
```

**Returns:** `Promise<void>`

---

### resume

**Added in:** v1.59

Resumes script execution. Throws if the debugger is not paused.

```ts
await debugger.resume();
```

**Returns:** `Promise<void>`

---

### runTo

**Added in:** v1.59

Resumes script execution and pauses when an action originates from the given source location. Throws if the debugger is not paused.

```ts
await debugger.runTo(location);
```

**Arguments:**

- `location` Object — The source location to pause at.
  - `file` string
  - `line` number (optional)
  - `column` number (optional)

**Returns:** `Promise<void>`

---

## Events

### on('pausedstatechanged')

**Added in:** v1.59

Emitted when the debugger pauses or resumes.

```ts
debugger.on('pausedstatechanged', data => {});
```
