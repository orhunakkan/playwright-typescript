# 📦 Playwright — GenericAssertions

> **Source:** [playwright.dev/docs/api/class-genericassertions](https://playwright.dev/docs/api/class-genericassertions)

---

## Overview

The **GenericAssertions** class provides assertion methods that can be used to make assertions about any values in the tests. A new instance of GenericAssertions is created by calling `expect()`.

```ts
import { test, expect } from '@playwright/test';

test('assert a value', async ({ page }) => {
  const value = 1;
  expect(value).toBe(2);
});
```

---

## Methods

### any

**Added in:** v1.9

`expect.any()` matches any object instance created from the constructor or a corresponding primitive type. Use it inside `expect(value).toEqual()` to perform pattern matching.

```ts
// Match instance of a class.
class Example {}
expect(new Example()).toEqual(expect.any(Example));
// Match any number.
expect({ prop: 1 }).toEqual({ prop: expect.any(Number) });
// Match any string.
expect('abc').toEqual(expect.any(String));
```

**Arguments:**

- `constructor` Function — Constructor of the expected object like `ExampleClass`, or a primitive boxed type like `Number`.

---

### anything

**Added in:** v1.9

`expect.anything()` matches everything except `null` and `undefined`. Use it inside `expect(value).toEqual()` to perform pattern matching.

```ts
const value = { prop: 1 };
expect(value).toEqual({ prop: expect.anything() });
expect(value).not.toEqual({ otherProp: expect.anything() });
```

---

### arrayContaining

**Added in:** v1.9

`expect.arrayContaining()` matches an array that contains all of the elements in the expected array, in any order. The received array may be a superset of the expected array and contain some extra elements.

```ts
expect([1, 2, 3]).toEqual(expect.arrayContaining([3, 1]));
expect([1, 2, 3]).not.toEqual(expect.arrayContaining([1, 4]));
```

**Arguments:**

- `expected` Array\<Object\> — Expected array that is a subset of the received value.

---

### arrayOf

**Added in:** v1.57

`expect.arrayOf()` matches array of objects created from the constructor or a corresponding primitive type. Use it inside `expect(value).toEqual()` to perform pattern matching.

```ts
// Match instance of a class.
class Example {}
expect([new Example(), new Example()]).toEqual(expect.arrayOf(Example));
// Match any string.
expect(['a', 'b', 'c']).toEqual(expect.arrayOf(String));
```

**Arguments:**

- `constructor` Function — Constructor of the expected object like `ExampleClass`, or a primitive boxed type like `Number`.

---

### closeTo

**Added in:** v1.9

Compares floating point numbers for approximate equality. Use this method inside `expect(value).toEqual()` to perform pattern matching. When just comparing two numbers, prefer `expect(value).toBeCloseTo()`.

```ts
expect({ prop: 0.1 + 0.2 }).not.toEqual({ prop: 0.3 });
expect({ prop: 0.1 + 0.2 }).toEqual({ prop: expect.closeTo(0.3, 5) });
```

**Arguments:**

- `expected` number — Expected value.
- `numDigits` number (optional) — The number of decimal digits after the decimal point that must be equal.

---

### objectContaining

**Added in:** v1.9

`expect.objectContaining()` matches an object that contains and matches all of the properties in the expected object. The received object may be a superset of the expected object and contain some extra properties.

```ts
// Assert some of the properties.
expect({ foo: 1, bar: 2 }).toEqual(expect.objectContaining({ foo: 1 }));
// Matchers can be used on the properties as well.
expect({ foo: 1, bar: 2 }).toEqual(expect.objectContaining({ bar: expect.any(Number) }));
// Complex matching of sub-properties.
expect({
  list: [1, 2, 3],
  obj: { prop: 'Hello world!', another: 'some other value' },
  extra: 'extra',
}).toEqual(
  expect.objectContaining({
    list: expect.arrayContaining([2, 3]),
    obj: expect.objectContaining({ prop: expect.stringContaining('Hello') }),
  })
);
```

**Arguments:**

- `expected` Object — Expected object pattern that contains a subset of the properties.

---

### stringContaining

**Added in:** v1.9

`expect.stringContaining()` matches a string that contains the expected substring. Use this method inside `expect(value).toEqual()` to perform pattern matching.

```ts
expect('Hello world!').toEqual(expect.stringContaining('Hello'));
```

**Arguments:**

- `expected` string — Expected substring.

---

### stringMatching

**Added in:** v1.9

`expect.stringMatching()` matches a received string that in turn matches the expected pattern. Use this method inside `expect(value).toEqual()` to perform pattern matching.

```ts
expect('123ms').toEqual(expect.stringMatching(/\d+m?s/));
// Inside another matcher.
expect({
  status: 'passed',
  time: '123ms',
}).toEqual({
  status: expect.stringMatching(/passed|failed/),
  time: expect.stringMatching(/\d+m?s/),
});
```

**Arguments:**

- `expected` string | RegExp — Pattern that expected string should match.

---

### toBe

**Added in:** v1.9

Compares value with expected by calling `Object.is`. This method compares objects by reference instead of their contents, similarly to the strict equality operator `===`.

```ts
const value = { prop: 1 };
expect(value).toBe(value);
expect(value).not.toBe({});
expect(value.prop).toBe(1);
```

**Arguments:**

- `expected` Object — Expected value.

---

### toBeCloseTo

**Added in:** v1.9

Compares floating point numbers for approximate equality. Use this method instead of `expect(value).toBe()` when comparing floating point numbers.

```ts
expect(0.1 + 0.2).not.toBe(0.3);
expect(0.1 + 0.2).toBeCloseTo(0.3, 5);
```

**Arguments:**

- `expected` number — Expected value.
- `numDigits` number (optional) — The number of decimal digits after the decimal point that must be equal.

---

### toBeDefined

**Added in:** v1.9

Ensures that value is not `undefined`.

```ts
const value = null;
expect(value).toBeDefined();
```

---

### toBeFalsy

**Added in:** v1.9

Ensures that value is false in a boolean context, one of `false`, `0`, `''`, `null`, `undefined` or `NaN`. Use this method when you don't care about the specific value.

```ts
const value = null;
expect(value).toBeFalsy();
```

---

### toBeGreaterThan

**Added in:** v1.9

Ensures that `value > expected` for number or big integer values.

```ts
const value = 42;
expect(value).toBeGreaterThan(1);
```

**Arguments:**

- `expected` number | bigint — The value to compare to.

---

### toBeGreaterThanOrEqual

**Added in:** v1.9

Ensures that `value >= expected` for number or big integer values.

```ts
const value = 42;
expect(value).toBeGreaterThanOrEqual(42);
```

**Arguments:**

- `expected` number | bigint — The value to compare to.

---

### toBeInstanceOf

**Added in:** v1.9

Ensures that value is an instance of a class. Uses `instanceof` operator.

```ts
expect(page).toBeInstanceOf(Page);
class Example {}
expect(new Example()).toBeInstanceOf(Example);
```

**Arguments:**

- `expected` Function — The class or constructor function.

---

### toBeLessThan

**Added in:** v1.9

Ensures that `value < expected` for number or big integer values.

```ts
const value = 42;
expect(value).toBeLessThan(100);
```

**Arguments:**

- `expected` number | bigint — The value to compare to.

---

### toBeLessThanOrEqual

**Added in:** v1.9

Ensures that `value <= expected` for number or big integer values.

```ts
const value = 42;
expect(value).toBeLessThanOrEqual(42);
```

**Arguments:**

- `expected` number | bigint — The value to compare to.

---

### toBeNaN

**Added in:** v1.9

Ensures that value is `NaN`.

```ts
const value = NaN;
expect(value).toBeNaN();
```

---

### toBeNull

**Added in:** v1.9

Ensures that value is `null`.

```ts
const value = null;
expect(value).toBeNull();
```

---

### toBeTruthy

**Added in:** v1.9

Ensures that value is true in a boolean context, anything but `false`, `0`, `''`, `null`, `undefined` or `NaN`. Use this method when you don't care about the specific value.

```ts
const value = { example: 'value' };
expect(value).toBeTruthy();
```

---

### toBeUndefined

**Added in:** v1.9

Ensures that value is `undefined`.

```ts
const value = undefined;
expect(value).toBeUndefined();
```

---

### toContain (string)

**Added in:** v1.9

Ensures that string value contains an expected substring. Comparison is case-sensitive.

```ts
const value = 'Hello, World';
expect(value).toContain('World');
expect(value).toContain(',');
```

**Arguments:**

- `expected` string — Expected substring.

---

### toContain (collection)

**Added in:** v1.9

Ensures that value is an `Array` or `Set` and contains an expected item.

```ts
const value = [1, 2, 3];
expect(value).toContain(2);
expect(new Set(value)).toContain(2);
```

**Arguments:**

- `expected` Object — Expected value in the collection.

---

### toContainEqual

**Added in:** v1.9

Ensures that value is an `Array` or `Set` and contains an item equal to the expected. For objects, this method recursively checks equality of all fields.

```ts
const value = [{ example: 1 }, { another: 2 }, { more: 3 }];
expect(value).toContainEqual({ another: 2 });
expect(new Set(value)).toContainEqual({ another: 2 });
```

**Arguments:**

- `expected` Object — Expected value in the collection.

---

### toEqual

**Added in:** v1.9

Compares contents of the value with contents of expected, performing "deep equality" check. For objects, this method recursively checks equality of all fields. `expect(value).toEqual()` ignores `undefined` properties and array items.

```ts
const value = { prop: 1 };
expect(value).toEqual({ prop: 1 });
```

Pattern matching with `toEqual`:

```ts
expect({
  list: [1, 2, 3],
  obj: { prop: 'Hello world!', another: 'some other value' },
  extra: 'extra',
}).toEqual(
  expect.objectContaining({
    list: expect.arrayContaining([2, 3]),
    obj: expect.objectContaining({ prop: expect.stringContaining('Hello') }),
  })
);
```

**Arguments:**

- `expected` Object — Expected value.

---

### toHaveLength

**Added in:** v1.9

Ensures that value has a `.length` property equal to expected. Useful for arrays and strings.

```ts
expect('Hello, World').toHaveLength(12);
expect([1, 2, 3]).toHaveLength(3);
```

**Arguments:**

- `expected` number — Expected length.

---

### toHaveProperty

**Added in:** v1.9

Ensures that property at provided `keyPath` exists on the object and optionally checks that property is equal to the expected. Equality is checked recursively, similarly to `expect(value).toEqual()`.

```ts
const value = {
  a: { b: [42] },
  c: true,
};
expect(value).toHaveProperty('a.b');
expect(value).toHaveProperty('a.b', [42]);
expect(value).toHaveProperty('a.b[0]', 42);
expect(value).toHaveProperty('c');
expect(value).toHaveProperty('c', true);
```

**Arguments:**

- `keyPath` string — Path to the property. Use dot notation `a.b` to check nested properties and indexed `a[2]` notation to check nested array items.
- `expected` Object (optional) — Optional expected value to compare the property to.

---

### toMatch

**Added in:** v1.9

Ensures that string value matches a regular expression.

```ts
const value = 'Is 42 enough?';
expect(value).toMatch(/Is \d+ enough/);
```

**Arguments:**

- `expected` RegExp | string — Regular expression to match against.

---

### toMatchObject

**Added in:** v1.9

Compares contents of the value with contents of expected, performing "deep equality" check. Allows extra properties to be present in the value. When comparing arrays, the number of items must match.

```ts
const value = { a: 1, b: 2, c: true };
expect(value).toMatchObject({ a: 1, c: true });
expect(value).toMatchObject({ b: 2, c: true });
expect([{ a: 1, b: 2 }]).toMatchObject([{ a: 1 }]);
```

**Arguments:**

- `expected` Object | Array — The expected object value to match against.

---

### toStrictEqual

**Added in:** v1.9

Compares contents of the value with contents of expected and their types. Differences from `toEqual`: keys with `undefined` properties are checked; array sparseness is checked; object types are checked to be equal.

```ts
const value = { prop: 1 };
expect(value).toStrictEqual({ prop: 1 });
```

**Arguments:**

- `expected` Object — Expected value.

---

### toThrow

**Added in:** v1.9

Calls the function and ensures it throws an error. Optionally compares the error with expected. Allowed expected values: Regular expression, String, Error object, or Error class.

```ts
expect(() => {
  throw new Error('Something bad');
}).toThrow();
expect(() => {
  throw new Error('Something bad');
}).toThrow(/something/);
expect(() => {
  throw new Error('Something bad');
}).toThrow(Error);
```

**Arguments:**

- `expected` Object (optional) — Expected error message or error object.

---

### toThrowError

**Added in:** v1.9

An alias for `expect(value).toThrow()`.

```ts
expect(() => {
  throw new Error('Something bad');
}).toThrowError();
```

**Arguments:**

- `expected` Object (optional) — Expected error message or error object.

---

## Properties

### not

**Added in:** v1.9

Makes the assertion check for the opposite condition.

```ts
const value = 1;
expect(value).not.toBe(2);
```

**Type:** `GenericAssertions`

---

### rejects

**Added in:** v1.9

Use `.rejects` to unwrap the reason of a rejected promise so any other matcher can be chained. If the promise is fulfilled the assertion fails.

```ts
test('rejects to octopus', async () => {
  await expect(Promise.reject(new Error('octopus'))).rejects.toThrow('octopus');
});
```

**Type:** `GenericAssertions`

---

### resolves

**Added in:** v1.9

Use `resolves` to unwrap the value of a fulfilled promise so any other matcher can be chained. If the promise is rejected the assertion fails.

```ts
test('resolves to lemon', async () => {
  await expect(Promise.resolve('lemon')).resolves.toBe('lemon');
});
```

**Type:** `GenericAssertions`
