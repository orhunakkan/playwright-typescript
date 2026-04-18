# 🔧 Playwright — Codegen Intro

> **Source:** [playwright.dev/docs/codegen-intro](https://playwright.dev/docs/codegen-intro)

---

## Introduction

Playwright can generate tests automatically, providing a quick way to get started with testing. Codegen opens a browser window for interaction and the Playwright Inspector for recording, copying, and managing your generated tests.

**You will learn:**

- How to record a test
- How to generate locators

---

## Running Codegen

Use the `codegen` command to run the test generator followed by the URL of the website you want to generate tests for. The URL is optional and can be added directly in the browser window if omitted.

```bash
npx playwright codegen demo.playwright.dev/todomvc
```

---

## Recording a test

Run codegen and perform actions in the browser. Playwright generates code for your interactions automatically. Codegen analyzes the rendered page and recommends the best locator, prioritizing role, text, and test id locators. When multiple elements match a locator, the generator improves it to uniquely identify the target element, reducing test failures and flakiness.

With the test generator you can record:

- **Actions** like click or fill by interacting with the page
- **Assertions** by clicking a toolbar icon, then clicking a page element to assert against. You can choose:
  - `assert visibility` — assert that an element is visible
  - `assert text` — assert that an element contains specific text
  - `assert value` — assert that an element has a specific value

When you finish interacting with the page, press the **record** button to stop recording and use the **copy** button to copy the generated code to your editor. Use the **clear** button to clear the code and start recording again. Once finished, close the Playwright Inspector window or stop the terminal command.

To learn more about generating tests, check out the detailed guide on [Codegen](codegen.md).

---

## Generating locators

You can generate locators with the test generator:

1. Press the **Record** button to stop recording — the **Pick Locator** button will appear
2. Click the **Pick Locator** button and hover over elements in the browser window to see the locator highlighted underneath each element
3. Click the element you want to locate — the code for that locator will appear in the locator playground next to the **Pick Locator** button
4. Edit the locator in the locator playground to fine-tune it and see the matching element highlighted in the browser window
5. Use the **copy** button to copy the locator and paste it into your code

---

## Emulation

You can generate tests using emulation for specific viewports, devices, color schemes, geolocation, language, or timezone. The test generator can also preserve authenticated state.

Check out the [Test Generator guide](codegen.md) to learn more.

---

## What's Next

- See a trace of your tests
