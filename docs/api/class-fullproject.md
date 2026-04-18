# 📦 Playwright — FullProject

> **Source:** [playwright.dev/docs/api/class-fullproject](https://playwright.dev/docs/api/class-fullproject)

---

Runtime representation of the test project configuration. It is accessible in the tests via `testInfo.project` and `workerInfo.project` and is passed to the test reporters. To see the format of the project in the Playwright configuration file please see `TestProject` instead.

---

## Properties

### dependencies

**Added in:** v1.31

See `testProject.dependencies`.

```ts
fullProject.dependencies;
```

**Type:** `Array<string>`

---

### grep

**Added in:** v1.10

See `testProject.grep`.

```ts
fullProject.grep;
```

**Type:** `RegExp | Array<RegExp>`

---

### grepInvert

**Added in:** v1.10

See `testProject.grepInvert`.

```ts
fullProject.grepInvert;
```

**Type:** `null | RegExp | Array<RegExp>`

---

### ignoreSnapshots

**Added in:** v1.59

See `testProject.ignoreSnapshots`.

```ts
fullProject.ignoreSnapshots;
```

**Type:** `boolean`

---

### metadata

**Added in:** v1.10

See `testProject.metadata`.

```ts
fullProject.metadata;
```

**Type:** `Metadata`

---

### name

**Added in:** v1.10

See `testProject.name`.

```ts
fullProject.name;
```

**Type:** `string`

---

### outputDir

**Added in:** v1.10

See `testProject.outputDir`.

```ts
fullProject.outputDir;
```

**Type:** `string`

---

### repeatEach

**Added in:** v1.10

See `testProject.repeatEach`.

```ts
fullProject.repeatEach;
```

**Type:** `number`

---

### retries

**Added in:** v1.10

See `testProject.retries`.

```ts
fullProject.retries;
```

**Type:** `number`

---

### snapshotDir

**Added in:** v1.10

See `testProject.snapshotDir`.

```ts
fullProject.snapshotDir;
```

**Type:** `string`

---

### teardown

**Added in:** v1.34

See `testProject.teardown`.

```ts
fullProject.teardown;
```

**Type:** `string`

---

### testDir

**Added in:** v1.10

See `testProject.testDir`.

```ts
fullProject.testDir;
```

**Type:** `string`

---

### testIgnore

**Added in:** v1.10

See `testProject.testIgnore`.

```ts
fullProject.testIgnore;
```

**Type:** `string | RegExp | Array<string | RegExp>`

---

### testMatch

**Added in:** v1.10

See `testProject.testMatch`.

```ts
fullProject.testMatch;
```

**Type:** `string | RegExp | Array<string | RegExp>`

---

### timeout

**Added in:** v1.10

See `testProject.timeout`.

```ts
fullProject.timeout;
```

**Type:** `number`

---

### use

**Added in:** v1.10

See `testProject.use`.

```ts
fullProject.use;
```

**Type:** `Fixtures`
