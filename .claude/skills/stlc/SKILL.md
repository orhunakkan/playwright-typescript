---
name: stlc
description: Run the whole software testing life cycle for one feature, from requirement analysis to closure report, stopping at the human gates. Resumes where it left off.
argument-hint: <feature> [requirements-file]
disable-model-invocation: true
---

# STLC orchestrator

Feature: `$0`. Optional requirements file: `$1`. If `$0` is empty, ask for a kebab-case feature
name and stop.

Every phase lives in `.claude/skills/stlc-<phase>/SKILL.md`. To run a phase, read that file and
follow it, with `$0` meaning `$0` and `$1` meaning `$1`. Don't invoke the phase skills as slash
commands; they're user-only.

## 0. Start

If `stlc/$0/` doesn't exist, run `npm run stlc:new -- $0`.

## 1. Find where to resume

Use only file contents and command exit codes; never memory of an earlier session. Read the
`status:` line of each artifact in `stlc/$0/`. Go through the phases in order and run the first
one that isn't done.

| Phase     | Done when                                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 analyze | `01-requirements.md` is `approved`                                                                                                             |
| 2 plan    | `02-test-plan.md` is `approved`. If it is `draft` and has no `{{` placeholder, the plan is written and waiting for the human: **stop** (see 3) |
| 3 design  | `03-test-cases.md` is `approved`                                                                                                               |
| 4 env     | never skipped. Run it right before phase 5 or 6                                                                                                |
| 5 build   | `npm run stlc:check-tests -- $0` exits 0                                                                                                       |
| 6 run     | `04-execution.md` is `complete`                                                                                                                |
| 7 triage  | `04-execution.md` is `complete`                                                                                                                |
| 8 report  | `05-closure.md` is `complete`                                                                                                                  |

After each phase, re-evaluate this table and continue with the next phase that isn't done.

## 2. Gates

Each phase file starts with `npm run stlc:gate -- $0 <phase>`. If it exits 1, stop and show its
reasons word for word. Never work around a closed gate, and never edit an artifact's status to
open one, except where a phase file says to.

## 3. Stops: end the turn and hand control to the user

- **Plan written** (after phase 2):
  - Show the coverage table and the strategist's review points.
  - Then say: "Review `stlc/$0/02-test-plan.md` and set `status: approved` in your editor, then
    run `/stlc $0` again."
  - You can't approve it yourself; a hook blocks it.
- **Visual baselines** (phase 5): wait for the user's answer as that phase file says.
- **Any closed gate or failing check** that the phase file says to stop on.
- **Finished** (phase 8 done).

## 4. Final summary (phase 8 done)

Report in this order:

1. The exit-criteria table and verdict from `stlc/$0/05-closure.md`.
2. Open defects, with severity.
3. Tests added, by type.
4. Artifacts written.
5. Anything that needs a human: baselines, contract drift, open questions in 01.

Then suggest committing on a branch and opening a PR. Don't commit unless asked.
