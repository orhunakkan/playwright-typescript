# 📦 Playwright — WorkerInfo

> **Source:** [playwright.dev/docs/api/class-workerinfo](https://playwright.dev/docs/api/class-workerinfo)

---

**WorkerInfo** contains information about the worker that is running tests and is available to worker-scoped fixtures. `WorkerInfo` is a subset of `TestInfo` that is available in many other places.

## Properties

### `workerInfo.config` — Added in: v1.10

Processed configuration from the configuration file.

**Type:** `FullConfig`

### `workerInfo.parallelIndex` — Added in: v1.10

The index of the worker between `0` and `workers - 1`. It is guaranteed that workers running at the same time have a different `parallelIndex`. When a worker is restarted, for example after a failure, the new worker process has the same `parallelIndex`.

Also available as `process.env.TEST_PARALLEL_INDEX`. Learn more about parallelism and sharding with Playwright Test.

**Type:** `number`

### `workerInfo.project` — Added in: v1.10

Processed project configuration from the configuration file.

**Type:** `FullProject`

### `workerInfo.workerIndex` — Added in: v1.10

The unique index of the worker process that is running the test. When a worker is restarted, for example after a failure, the new worker process gets a new unique `workerIndex`.

Also available as `process.env.TEST_WORKER_INDEX`. Learn more about parallelism and sharding with Playwright Test.

**Type:** `number`
