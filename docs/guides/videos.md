# 🎥 Playwright — Videos

> **Source:** [playwright.dev/docs/videos](https://playwright.dev/docs/videos)

---

## Introduction

With Playwright you can record videos for your tests.

## Record video

Playwright Test can record videos for your tests, controlled by the **video** option in your Playwright config. By default videos are off.

- `'off'` — Do not record video.
- `'on'` — Record video for each test.
- `'retain-on-failure'` — Record video for each test, but remove all videos from successful test runs.
- `'on-first-retry'` — Record video only when retrying a test for the first time.

Video files will appear in the test output directory, typically `test-results`. See `testOptions.video` for advanced video configuration. Videos are saved upon browser context closure at the end of a test. If you create a browser context manually, make sure to `await browserContext.close()`.

**Playwright Test:**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    video: 'on-first-retry',
  },
});
```

**Library:**

```ts
const context = await browser.newContext({ recordVideo: { dir: 'videos/' } });
// Make sure to await close, so that videos are saved.
await context.close();
```

You can also specify video size and annotation. The video size defaults to the viewport size scaled down to fit 800x800. The video of the viewport is placed in the top-left corner of the output video, scaled down to fit if necessary. You may need to set the viewport size to match your desired video size.

When `show: { actions }` is specified, each action will be visually highlighted in the video with the element outline and action title subtitle. The optional `duration` property controls how long each annotation is displayed (defaults to 500ms). When `show: { test }` is specified, video will be annotated with the current test information with configurable level.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    video: {
      mode: 'on-first-retry',
      size: { width: 640, height: 480 },
      show: {
        actions: {
          duration: 500,
          position: 'top-right',
          fontSize: 14,
        },
        test: {
          level: 'step',
          position: 'top-left',
          fontSize: 12,
        },
      },
    },
  },
});
```

For multi-page scenarios, you can access the video file associated with the page via `page.video()`.

```ts
const path = await page.video().path();
```

> Note that the video is only available after the page or browser context is closed.

---

## 🗂️ Quick Reference

| Mode                  | Behavior                      |
| --------------------- | ----------------------------- |
| `'off'`               | No video recorded             |
| `'on'`                | Record for every test         |
| `'retain-on-failure'` | Record all, delete on success |
| `'on-first-retry'`    | Record only on first retry    |
