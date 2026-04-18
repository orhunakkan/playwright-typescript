# 📦 Playwright — Weberror

> **Source:** [playwright.dev/docs/api/class-weberror](https://playwright.dev/docs/api/class-weberror)

---

## WebErrorWebError class represents an unhandled exception thrown in the page. It is dispatched via the browserContext.on('weberror') event. // Log all uncaught errors to the terminalcontext.on('weberror', webError => { console.log(`Uncaught exception: "${webError.error()}"`);});// Navigate to a page with an exception.await page.goto('data:text/html,<script>throw new Error("Test")</script>'); Methods

error​ Added in: v1.38 webError.error Unhandled error that was thrown

webError.error(); Returns Error# page​ Added in: v1.38 webError.page The page that produced this unhandled exception, if any

webError.page(); Returns null | Page#
