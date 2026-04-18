# 🔒 Playwright — Browser Contexts (Isolation)

> **Source:** [playwright.dev/docs/browser-contexts](https://playwright.dev/docs/browser-contexts)

---

## Introduction

Tests written with Playwright execute in isolated clean-slate environments called browser contexts. This isolation model improves reproducibility and prevents cascading test failures.

---

## What is Test Isolation?

Test Isolation is when each test is completely isolated from another test. Every test runs independently from any other test. This means that each test has its own local storage, session storage, cookies etc. Playwright achieves this using **BrowserContexts** which are equivalent to incognito-like profiles. They are fast and cheap to create and are completely isolated, even when running in a single browser.

Playwright creates a context for each test, and provides a default Page in that context.

---

## Why is Test Isolation Important?

- **No failure carry-over**: If one test fails it doesn't affect the other test
- **Easy to debug errors or flakiness**: You can run just a single test as many times as you'd like
- **Don't have to think about the order** when running in parallel, sharding, etc

---

## Two Ways of Test Isolation

There are two different strategies when it comes to Test Isolation: **start from scratch** or **cleanup in between**.

The problem with cleaning up in between tests is that it can be easy to forget to clean up and some things are impossible to clean up such as "visited links". State from one test can leak into the next test which could cause your test to fail and make debugging harder as the problem comes from another test.

Starting from scratch means everything is new, so if the test fails you only have to look within that test to debug.

---

## How Playwright Achieves Test Isolation

Playwright uses **browser contexts** to achieve Test Isolation. Each test has its own Browser Context. Running the test creates a new browser context each time.

When using Playwright as a Test Runner, browser contexts are created by default. Otherwise, you can create browser contexts manually.

### Using Playwright Test Runner

```ts
import { test } from '@playwright/test';

test('example test', async ({ page, context }) => {
  // "context" is an isolated BrowserContext, created for this specific test.
  // "page" belongs to this context.
});

test('another test', async ({ page, context }) => {
  // "context" and "page" in this second test are completely
  // isolated from the first test.
});
```

### Using Playwright Library

```ts
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
```

Browser contexts can also be used to emulate multi-page scenarios involving mobile devices, permissions, locale and color scheme. Check out our Emulation guide for more details.

---

## Multiple Contexts in a Single Test

Playwright can create multiple browser contexts within a single scenario. This is useful when you want to test for multi-user functionality, like a chat.

### Using Playwright Test Runner

```ts
import { test } from '@playwright/test';

test('admin and user', async ({ browser }) => {
  // Create two isolated browser contexts
  const adminContext = await browser.newContext();
  const userContext = await browser.newContext();

  // Create pages and interact with contexts independently
  const adminPage = await adminContext.newPage();
  const userPage = await userContext.newPage();
});
```

### Using Playwright Library

```ts
const { chromium } = require('playwright');

// Create a Chromium browser instance
const browser = await chromium.launch();

// Create two isolated browser contexts
const userContext = await browser.newContext();
const adminContext = await browser.newContext();

// Create pages and interact with contexts independently
const adminPage = await adminContext.newPage();
const userPage = await userContext.newPage();
```

---

## 🗂️ Quick Reference

| What                         | How                                                             |
| ---------------------------- | --------------------------------------------------------------- |
| Create context (Test Runner) | Automatic via `{ page, context }` fixtures                      |
| Create context (Library)     | `await browser.newContext()`                                    |
| Create page in context       | `await context.newPage()`                                       |
| Multiple contexts            | `await browser.newContext()` for each                           |
| Isolated storage             | Each context has separate cookies, localStorage, sessionStorage |
| Emulation                    | `await browser.newContext({ viewport, userAgent, ... })`        |
