# 📦 Playwright — Worker

> **Source:** [playwright.dev/docs/api/class-worker](https://playwright.dev/docs/api/class-worker)

---

The **Worker** class represents a WebWorker. `worker` event is emitted on the page object to signal a worker creation. `close` event is emitted on the worker object when the worker is gone.

```ts
page.on('worker', (worker) => {
  console.log('Worker created: ' + worker.url());
  worker.on('close', (worker) => console.log('Worker destroyed: ' + worker.url()));
});
console.log('Current workers:');
for (const worker of page.workers()) console.log(' ' + worker.url());
```

## Methods

### `evaluate()` — Added before v1.9

Returns the return value of `pageFunction`. If the function passed to `worker.evaluate()` returns a `Promise`, then `worker.evaluate()` would wait for the promise to resolve and return its value. If the function passed to `worker.evaluate()` returns a non-Serializable value, then `worker.evaluate()` returns `undefined`. Playwright also supports transferring some additional values that are not serializable by JSON: `-0`, `NaN`, `Infinity`, `-Infinity`.

```ts
await worker.evaluate(pageFunction);
await worker.evaluate(pageFunction, arg);
```

**Arguments:**

- `pageFunction` `function | string` — Function to be evaluated in the worker context.
- `arg` `EvaluationArgument` _(optional)_ — Optional argument to pass to `pageFunction`.

**Returns:** `Promise<Serializable>`

### `evaluateHandle()` — Added before v1.9

Returns the return value of `pageFunction` as a `JSHandle`. The only difference between `worker.evaluate()` and `worker.evaluateHandle()` is that `worker.evaluateHandle()` returns `JSHandle`. If the function passed to `worker.evaluateHandle()` returns a `Promise`, then `worker.evaluateHandle()` would wait for the promise to resolve and return its value.

```ts
await worker.evaluateHandle(pageFunction);
await worker.evaluateHandle(pageFunction, arg);
```

**Arguments:**

- `pageFunction` `function | string` — Function to be evaluated in the worker context.
- `arg` `EvaluationArgument` _(optional)_ — Optional argument to pass to `pageFunction`.

**Returns:** `Promise<JSHandle>`

### `url()` — Added before v1.9

```ts
worker.url();
```

**Returns:** `string`

### `waitForEvent()` — Added in: v1.57

Waits for event to fire and passes its value into the predicate function. Returns when the predicate returns truthy value. Will throw an error if the page is closed before the event is fired. Returns the event data value.

```ts
// Start waiting for download before clicking. Note no await.
const consolePromise = worker.waitForEvent('console');
await worker.evaluate('console.log(42)');
const consoleMessage = await consolePromise;
```

**Arguments:**

- `event` `string` — Event name, same one typically passed into `*.on(event)`.
- `optionsOrPredicate` `function | Object` _(optional)_ — Either a predicate that receives an event or an options object.
  - `predicate` `function` — Receives the event data and resolves to truthy value when the waiting should resolve.
  - `timeout` `number` _(optional)_ — Maximum time to wait for in milliseconds. Defaults to `0` (no timeout). The default value can be changed via `actionTimeout` option in the config, or by using `browserContext.setDefaultTimeout()` or `page.setDefaultTimeout()`.
- `options` `Object` _(optional)_
  - `predicate` `function` _(optional)_ — Receives the event data and resolves to truthy value when the waiting should resolve.

**Returns:** `Promise<Object>`

## Events

### `on('close')` — Added before v1.9

Emitted when this dedicated WebWorker is terminated.

```ts
worker.on('close', (data) => {});
```

**Event data:** `Worker`

### `on('console')` — Added in: v1.57

Emitted when JavaScript within the worker calls one of console API methods, e.g. `console.log` or `console.dir`.

```ts
worker.on('console', (data) => {});
```

**Event data:** `ConsoleMessage`
