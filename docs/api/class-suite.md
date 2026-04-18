# 📦 Playwright — Suite

> **Source:** [playwright.dev/docs/api/class-suite](https://playwright.dev/docs/api/class-suite)

---

**Suite** is a group of tests. All tests in Playwright Test form the following hierarchy:

- Root suite has a child suite for each `FullProject`.
- Project suite `#root` has a child suite for each test file in the project.
- File suite has a child suite for each `test.describe()` group in the file.
- Describe suite has `TestCase` instances for each `test()` call.

Reporter receives suite objects via the `reporter.onBegin()` call.

---

## Methods

## Methods

### `suite.allTests()` — Added in: v1.10

Returns the list of all test cases in this suite and its descendants, as opposed to `suite.tests` that only includes direct children.

```ts
suite.allTests();
```

**Returns:** `Array<TestCase>`

---

### `suite.entries()` — Added in: v1.44

Iterates over all entries (suites and test cases) in this suite in their declaration order.

```ts
for (const entry of suite.entries()) {
  if (entry instanceof TestCase) console.log('Test:', entry.title);
  else console.log('Suite:', entry.title);
}
```

**Returns:** `Array<TestCase | Suite>`

---

### `suite.project()` — Added in: v1.10

Configuration of the project this suite belongs to, or `undefined` for the root suite.

```ts
suite.project();
```

**Returns:** `FullProject | undefined`

---

### `suite.titlePath()` — Added in: v1.10

Returns a list of titles from the root down to this suite.

```ts
suite.titlePath();
```

**Returns:** `Array<string>`

---

## Properties

### `suite.location` — Added in: v1.10

Location in the source where the suite is defined. Missing for root and project suites.

**Type:** `Location`

---

### `suite.parent` — Added in: v1.10

Parent suite, missing for the root suite.

**Type:** `Suite`

---

### `suite.suites` — Added in: v1.10

Child suites. See `Suite` for the hierarchy of suites.

**Type:** `Array<Suite>`

---

### `suite.tests` — Added in: v1.10

Test cases in the suite. Note that only test cases directly belonging to this suite are in the list. Any test cases defined in nested `test.describe()` groups are listed in the child `suite.suites`.

**Type:** `Array<TestCase>`

---

### `suite.title` — Added in: v1.10

Suite title:

- Empty string for root suite.
- Project name for project suite.
- File path for file suite.
- `test.describe()` title for group suite.

**Type:** `string`

---

### `suite.type` — Added in: v1.44

Returns the type of the suite: `"root"`, `"project"`, `"file"`, or `"describe"`.

**Type:** `"root" | "project" | "file" | "describe"`
