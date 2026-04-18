# 🖼️ Playwright — Frames

> **Source:** [playwright.dev/docs/frames](https://playwright.dev/docs/frames)

---

## Introduction

A Page can have one or more Frame objects attached to it. Each page has a main frame and page-level interactions (like click) are assumed to operate in the main frame. A page can have additional frames attached with the `iframe` HTML tag. These frames can be accessed for interactions inside the frame.

```ts
// Locate element inside frame
const username = await page.frameLocator('.frame-class').getByLabel('User Name');
await username.fill('John');
```

---

## Frame objects

One can access frame objects using the `page.frame()` API:

```ts
// Get frame using the frame's name attribute
const frame = page.frame('frame-login');
// Get frame using frame's URL
const frame = page.frame({ url: /.*domain.*/ });
// Interact with the frame
await frame.fill('#username-input', 'John');
```
