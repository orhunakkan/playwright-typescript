---
id: { { id } }
feature: { { feature } }
ac: { { ac } }
severity: major # critical | major | minor | trivial
status: open # open | fixed | wont-fix | duplicate
found: { { date } }
env: { { env } }
test: { { test } }
---

# {{id}}: {{one-line summary}}

## Summary

{{what is wrong, in one or two sentences}}

## Steps to reproduce

1. {{step}}

## Expected

{{expected behaviour, citing the AC}}

## Actual

{{observed behaviour}}

## Evidence

- Trace: {{test-results/<test>/trace.zip}}
- Screenshot: {{test-results/<test>/test-failed-1.png}}
