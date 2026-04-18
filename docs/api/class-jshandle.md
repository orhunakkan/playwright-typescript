# 📦 Playwright — JSHandle

> **Source:** [playwright.dev/docs/api/class-jshandle](https://playwright.dev/docs/api/class-jshandle)

---

## Overview

**JSHandle** represents an in-page JavaScript object. JSHandles can be created with the `page.evaluateHandle()` method.

```ts
const windowHandle = await page.evaluateHandle(() => window);
// ...
```

JSHandle prevents the referenced JavaScript object being garbage collected unless the handle is exposed with `jsHandle.dispose()`. JSHandles are auto-disposed when their origin frame gets navigated or the parent context gets destroyed.

JSHandle instances can be used as an argument in `page.$eval()`, `page.evaluate()`, and `page.evaluateHandle()` methods.

---

## Methods

### asElement

**Added before:** v1.9

Returns either `null` or the object handle itself, if the object handle is an instance of `ElementHandle`.

```ts
jsHandle.asElement();
```

**Returns:** `null | ElementHandle`

---

### dispose

**Added before:** v1.9

The `jsHandle.dispose` method stops referencing the element handle.

```ts
await jsHandle.dispose();
```

**Returns:** `Promise<void>`

---

### evaluate

**Added before:** v1.9

Returns the return value of `pageFunction`. This method passes this handle as the first argument to `pageFunction`.

If `pageFunction` returns a Promise, then `handle.evaluate` would wait for the promise to resolve and return its value.

```ts
const tweetHandle = await page.$('.tweet .retweets');
expect(await tweetHandle.evaluate((node) => node.innerText)).toBe('10 retweets');
```

**Arguments:**

- `pageFunction` function | string — Function to be evaluated in the page context.
- `arg` EvaluationArgument (optional) — Optional argument to pass to `pageFunction`.

**Returns:** `Promise<Serializable>`

---

### evaluateHandle

**Added before:** v1.9

Returns the return value of `pageFunction` as a `JSHandle`. This method passes this handle as the first argument to `pageFunction`.

The only difference between `jsHandle.evaluate` and `jsHandle.evaluateHandle` is that `jsHandle.evaluateHandle` returns `JSHandle`. If the function passed to `jsHandle.evaluateHandle` returns a Promise, then `jsHandle.evaluateHandle` would wait for the promise to resolve and return its value. See `page.evaluateHandle()` for more details.

```ts
await jsHandle.evaluateHandle(pageFunction);
await jsHandle.evaluateHandle(pageFunction, arg);
```

**Arguments:**

- `pageFunction` function | string — Function to be evaluated in the page context.
- `arg` EvaluationArgument (optional) — Optional argument to pass to `pageFunction`.

**Returns:** `Promise<JSHandle>`

---

### getProperties

**Added before:** v1.9

The method returns a map with own property names as keys and JSHandle instances for the property values.

```ts
const handle = await page.evaluateHandle(() => ({ window, document }));
const properties = await handle.getProperties();
const windowHandle = properties.get('window');
const documentHandle = properties.get('document');
await handle.dispose();
```

**Returns:** `Promise<Map<string, JSHandle>>`

---

### getProperty

**Added before:** v1.9

Fetches a single property from the referenced object.

```ts
await jsHandle.getProperty(propertyName);
```

**Arguments:**

- `propertyName` string — Property to get.

**Returns:** `Promise<JSHandle>`

---

### jsonValue

**Added before:** v1.9

Returns a JSON representation of the object. If the object has a `toJSON` function, it will not be called.

> **Note:** The method will return an empty JSON object if the referenced object is not stringifiable. It will throw an error if the object has circular references.

```ts
await jsHandle.jsonValue();
```

**Returns:** `Promise<Serializable>`
