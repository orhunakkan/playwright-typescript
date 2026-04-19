# 📦 Playwright — FullConfig

> **Source:** [playwright.dev/docs/api/class-fullconfig](https://playwright.dev/docs/api/class-fullconfig)

---

Resolved configuration which is accessible via `testInfo.config` and is passed to the test reporters. To see the format of Playwright configuration file, please see `TestConfig` instead.

## Properties

### configFile

**Added in:** v1.20

Path to the configuration file used to run the tests. The value is an empty string if no config file was used.

```ts
fullConfig.configFile;
```

**Type:** `string`

### forbidOnly

**Added in:** v1.10

See `testConfig.forbidOnly`.

```ts
fullConfig.forbidOnly;
```

**Type:** `boolean`

### fullyParallel

**Added in:** v1.20

See `testConfig.fullyParallel`.

```ts
fullConfig.fullyParallel;
```

**Type:** `boolean`

### globalSetup

**Added in:** v1.10

See `testConfig.globalSetup`.

```ts
fullConfig.globalSetup;
```

**Type:** `null | string`

### globalTeardown

**Added in:** v1.10

See `testConfig.globalTeardown`.

```ts
fullConfig.globalTeardown;
```

**Type:** `null | string`

### globalTimeout

**Added in:** v1.10

See `testConfig.globalTimeout`.

```ts
fullConfig.globalTimeout;
```

**Type:** `number`

### grep

**Added in:** v1.10

See `testConfig.grep`.

```ts
fullConfig.grep;
```

**Type:** `RegExp | Array<RegExp>`

### grepInvert

**Added in:** v1.10

See `testConfig.grepInvert`.

```ts
fullConfig.grepInvert;
```

**Type:** `null | RegExp | Array<RegExp>`

### maxFailures

**Added in:** v1.10

See `testConfig.maxFailures`.

```ts
fullConfig.maxFailures;
```

**Type:** `number`

### metadata

**Added in:** v1.10

See `testConfig.metadata`.

```ts
fullConfig.metadata;
```

**Type:** `Metadata`

### preserveOutput

**Added in:** v1.10

See `testConfig.preserveOutput`.

```ts
fullConfig.preserveOutput;
```

**Type:** `"always" | "never" | "failures-only"`

### projects

**Added in:** v1.10

List of resolved projects.

```ts
fullConfig.projects;
```

**Type:** `Array<FullProject>`

### quiet

**Added in:** v1.10

See `testConfig.quiet`.

```ts
fullConfig.quiet;
```

**Type:** `boolean`

### reportSlowTests

**Added in:** v1.10

See `testConfig.reportSlowTests`.

```ts
fullConfig.reportSlowTests;
```

**Type:** `null | Object`

- `max` number — The maximum number of slow test files to report.
- `threshold` number — Test file duration in milliseconds that is considered slow.

### reporter

**Added in:** v1.10

See `testConfig.reporter`.

```ts
fullConfig.reporter;
```

**Type:** `string | Array<Object> | "list" | "dot" | "line" | "github" | "json" | "junit" | "null" | "html"`

### rootDir

**Added in:** v1.20

Base directory for all relative paths used in the reporters.

```ts
fullConfig.rootDir;
```

**Type:** `string`

### shard

**Added in:** v1.10

See `testConfig.shard`.

```ts
fullConfig.shard;
```

**Type:** `null | Object`

- `total` number — The total number of shards.
- `current` number — The index of the shard to execute, one-based.

### tags

**Added in:** v1.57

Resolved global tags. See `testConfig.tag`.

```ts
fullConfig.tags;
```

**Type:** `Array<string>`

### updateSnapshots

**Added in:** v1.10

See `testConfig.updateSnapshots`.

```ts
fullConfig.updateSnapshots;
```

**Type:** `"all" | "changed" | "missing" | "none"`

### updateSourceMethod

**Added in:** v1.50

See `testConfig.updateSourceMethod`.

```ts
fullConfig.updateSourceMethod;
```

**Type:** `"overwrite" | "3way" | "patch"`

### version

**Added in:** v1.20

Playwright version.

```ts
fullConfig.version;
```

**Type:** `string`

### webServer

**Added in:** v1.10

See `testConfig.webServer`.

```ts
fullConfig.webServer;
```

**Type:** `null | Object`

### workers

**Added in:** v1.10

See `testConfig.workers`.

```ts
fullConfig.workers;
```

**Type:** `number`
