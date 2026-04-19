# 📦 Playwright — SnapshotAssertions

> **Source:** [playwright.dev/docs/api/class-snapshotassertions](https://playwright.dev/docs/api/class-snapshotassertions)

---

**SnapshotAssertions** provides assertion methods that compare values with stored snapshots. The snapshots are stored in a dedicated folder alongside the test file (configurable by `snapshotDir` and `snapshotPathTemplate` in playwright.config.ts).

```ts
// Basic snapshot assertion
expect(results).toMatchSnapshot('results.txt');
```

## Methods

## Methods

### `snapshotAssertions.toMatchSnapshot(name, options?)` — Added in: v1.22

Ensures that passed value, either a string or a Buffer, matches the expected snapshot stored in the test snapshots directory.

```ts
// Pass snapshot name as a string
expect(await page.title()).toMatchSnapshot('page-title.txt');
```

**Arguments:**

| Parameter                   | Type                      | Description                                                                                                                                                              |
| --------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                      | `string \| Array<string>` | Snapshot name.                                                                                                                                                           |
| `options.maxDiffPixelRatio` | `number` (optional)       | An acceptable ratio of pixels that are different to the total amount of pixels, between 0 and 1. Default is configurable with `TestConfig.expect`.                       |
| `options.maxDiffPixels`     | `number` (optional)       | An acceptable number of pixels that could be different. Default is configurable with `TestConfig.expect`.                                                                |
| `options.threshold`         | `number` (optional)       | An acceptable perceived color difference between the same pixel in compared images, ranges from 0 (strict) to 1 (lax). Default is configurable with `TestConfig.expect`. |

**Returns:** `void`

### `snapshotAssertions.toMatchSnapshot(options?)` — Added in: v1.22

Ensures that passed value, either a string or a Buffer, matches the expected snapshot stored in the test snapshots directory.

```ts
// Instead of a name, pass options with a name property
expect(await page.title()).toMatchSnapshot({ name: 'page-title.txt' });
```

**Arguments:**

| Parameter                   | Type                                 | Description                                                                                                                                                              |
| --------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options.maxDiffPixelRatio` | `number` (optional)                  | An acceptable ratio of pixels that are different to the total amount of pixels, between 0 and 1. Default is configurable with `TestConfig.expect`.                       |
| `options.maxDiffPixels`     | `number` (optional)                  | An acceptable number of pixels that could be different. Default is configurable with `TestConfig.expect`.                                                                |
| `options.name`              | `string \| Array<string>` (optional) | Snapshot name. If not passed, the test name and ordinals are used when called multiple times.                                                                            |
| `options.threshold`         | `number` (optional)                  | An acceptable perceived color difference between the same pixel in compared images, ranges from 0 (strict) to 1 (lax). Default is configurable with `TestConfig.expect`. |

**Returns:** `void`
