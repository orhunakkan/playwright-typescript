# 📦 Playwright — Clock

> **Source:** [playwright.dev/docs/api/class-clock](https://playwright.dev/docs/api/class-clock)

---

## Overview

Accurately simulating time-dependent behavior is essential for verifying the correctness of applications. Note that clock is installed for the entire `BrowserContext`, so the time in all the pages and iframes is controlled by the same clock.

---

## Methods

### fastForward

**Added in:** v1.45

Advance the clock by jumping forward in time. Only fires due timers at most once. This is equivalent to user closing the laptop lid for a while and reopening it later, after given time.

```ts
await page.clock.fastForward(1000);
await page.clock.fastForward('30:00');
```

**Arguments:**

- `ticks` number | string — Time may be the number of milliseconds to advance the clock by or a human-readable string. Valid string formats are `"08"` for eight seconds, `"01:00"` for one minute and `"02:34:10"` for two hours, 34 minutes and ten seconds.

**Returns:** `Promise<void>`

---

### install

**Added in:** v1.45

Install fake implementations for the following time-related functions: `Date`, `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`, `requestAnimationFrame`, `cancelAnimationFrame`, `requestIdleCallback`, `cancelIdleCallback`, `performance`.

Fake timers are used to manually control the flow of time in tests. See `clock.runFor()` and `clock.fastForward()` for more information.

```ts
await clock.install();
await clock.install(options);
```

**Arguments:**

- `options` Object (optional)
  - `time` number | string | Date (optional) — Time to initialize with, current system time by default.

**Returns:** `Promise<void>`

---

### pauseAt

**Added in:** v1.45

Advance the clock by jumping forward in time and pause the time. Once this method is called, no timers are fired unless `clock.runFor()`, `clock.fastForward()`, `clock.pauseAt()` or `clock.resume()` is called. Only fires due timers at most once.

```ts
await page.clock.pauseAt(new Date('2020-02-02'));
await page.clock.pauseAt('2020-02-02');
```

For best results, install the clock before navigating the page and set it to a time slightly before the intended test time:

```ts
// Initialize clock with some time before the test time and let the page load
// naturally. `Date.now` will progress as the timers fire.
await page.clock.install({ time: new Date('2024-12-10T08:00:00') });
await page.goto('http://localhost:3333');
await page.clock.pauseAt(new Date('2024-12-10T10:00:00'));
```

**Arguments:**

- `time` number | string | Date — Time to pause at.

**Returns:** `Promise<void>`

---

### resume

**Added in:** v1.45

Resumes timers. Once this method is called, time resumes flowing, timers are fired as usual.

```ts
await clock.resume();
```

**Returns:** `Promise<void>`

---

### runFor

**Added in:** v1.45

Advance the clock, firing all the time-related callbacks.

```ts
await page.clock.runFor(1000);
await page.clock.runFor('30:00');
```

**Arguments:**

- `ticks` number | string — Time may be the number of milliseconds to advance the clock by or a human-readable string. Valid string formats are `"08"` for eight seconds, `"01:00"` for one minute and `"02:34:10"` for two hours, 34 minutes and ten seconds.

**Returns:** `Promise<void>`

---

### setFixedTime

**Added in:** v1.45

Makes `Date.now` and `new Date()` return fixed fake time at all times, keeps all the timers running. Use this method for simple scenarios where you only need to test with a predefined time. For more advanced scenarios, use `clock.install()` instead.

```ts
await page.clock.setFixedTime(Date.now());
await page.clock.setFixedTime(new Date('2020-02-02'));
await page.clock.setFixedTime('2020-02-02');
```

**Arguments:**

- `time` number | string | Date — Time to be set in milliseconds.

**Returns:** `Promise<void>`

---

### setSystemTime

**Added in:** v1.45

Sets system time, but does not trigger any timers. Use this to test how the web page reacts to a time shift, for example switching from summer to winter time, or changing time zones.

```ts
await page.clock.setSystemTime(Date.now());
await page.clock.setSystemTime(new Date('2020-02-02'));
await page.clock.setSystemTime('2020-02-02');
```

**Arguments:**

- `time` number | string | Date — Time to be set in milliseconds.

**Returns:** `Promise<void>`
