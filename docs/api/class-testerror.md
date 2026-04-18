# 📦 Playwright — Testerror

> **Source:** [playwright.dev/docs/api/class-testerror](https://playwright.dev/docs/api/class-testerror)

---

## TestErrorInformation about an error thrown during test execution

cause​ Added in: v1.49 testError.cause Error cause. Set when there is a cause for the error. Will be undefined if there is no cause or if the cause is not an instance of

## Error

testError.cause Type TestError location

Added in: v1.30 testError.location

## Error location in the source code

testError.location Type Location message

Added in: v1.10 testError.message Error message. Set when Error (or its subclass) has been thrown.

## Usage testError.message Type string snippet

Added in: v1.33 testError.snippet Source code snippet with highlighted error.

## Usage testError.snippet Type string stack

Added in: v1.10 testError.stack Error stack. Set when

## Error (or its subclass) has been thrown

testError.stack Type string value

Added in: v1.10 testError.value The value that was thrown. Set when anything except the Error (or its subclass) has been thrown

testError.value Type string
