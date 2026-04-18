# 📦 Playwright — APIResponseAssertions

> **Source:** [playwright.dev/docs/api/class-apiresponseassertions](https://playwright.dev/docs/api/class-apiresponseassertions)

---

The **APIResponseAssertions** class provides assertion methods that can be used to make assertions about the **APIResponse** in the tests.

**Example:**

```ts
import { test, expect } from '@playwright/test';

test('navigates to login', async ({ page }) => {
  // ...
  const response = await page.request.get('https://playwright.dev');
  await expect(response).toBeOK();
});
```

---

## Methods

### toBeOK

**Added in:** v1.18

Ensures the response status code is within **200..299** range.

```ts
await expect(response).toBeOK();
```

**Returns:** Promise<void>

---

## Properties

### not

**Added in:** v1.20

Makes the assertion check for the opposite condition.

**Example:**

```ts
// Test that the response status is NOT successful
await expect(response).not.toBeOK();
```

**Type:** APIResponseAssertions
