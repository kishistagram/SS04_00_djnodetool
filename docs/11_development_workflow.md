# Development Workflow

## Purpose

This document defines how Claude Code should be used in this project.

The goal is to prevent uncontrolled implementation, keep context clean, and make design decisions reviewable.

This project is both a product prototype and a learning project, so the process should prioritize:

* clear planning
* small implementation steps
* readable code
* reviewable diffs
* explicit trade-offs
* preserved design decisions

## Core Principle

Claude should not jump directly into implementation for non-trivial work.

For feature work, architectural changes, or behavior changes, use this workflow:

1. Explore
2. Plan
3. Code
4. Review
5. Commit

Small documentation edits may skip the full workflow, but implementation work should not.

---

## Phase 1: Explore

Claude should first inspect the relevant documents and source files.

During this phase, Claude should not write code.

Claude should summarize:

* the current project structure
* relevant files
* existing behavior
* unclear requirements
* implementation risks
* assumptions that need confirmation

Example prompt:

```md
Read `CLAUDE.md`, the relevant files under `docs/`, and the relevant source files.

Summarize the current state and identify any ambiguity.

Do not write code yet.
```

Use this phase when:

* starting a new feature
* modifying existing behavior
* debugging unclear behavior
* touching architecture
* changing domain types
* changing audio, storage, or UI flow

---

## Phase 2: Plan

After exploration, Claude should propose an implementation plan.

The plan should include:

* files to create
* files to modify
* implementation order
* expected behavior
* data model impact
* UI impact
* testing approach
* known trade-offs
* out-of-scope items

Claude should wait for human approval before coding.

Example prompt:

```md
Based on your exploration, propose an implementation plan.

Do not write code yet.

Include:
1. files to create or modify
2. implementation steps
3. trade-offs
4. testing approach
5. what is intentionally out of scope
```

For larger tasks, save the approved plan under:

```txt
docs/plans/
```

Example:

```txt
docs/plans/2026-06-10-add-domain-types.md
```

Plan files are useful because they allow the task to be resumed after `/clear` without relying on a long conversation history.

---

## Phase 3: Code

Claude should implement only the approved plan.

Implementation rules:

* Keep changes small.
* Do not modify unrelated files.
* Do not add out-of-scope features.
* Do not rewrite the project structure without approval.
* Do not introduce a backend unless explicitly requested.
* Do not add major dependencies without explaining why.
* Keep domain logic separate from UI logic.
* Keep audio logic separate from React components.
* Explain changed files after implementation.

For implementation work, prefer one small step at a time.

Good:

```txt
Create only `src/domain/types.ts` and `src/domain/mockProject.ts`.
```

Bad:

```txt
Build the whole app.
```

---

## Test-First Preference

When behavior can be tested, prefer writing tests before implementation.

Claude should not modify tests just to make them pass.

Useful prompt pattern:

```md
First, write tests for the approved behavior.

Do not implement the feature yet.

After the tests are written, explain what they verify.
```

Then:

```md
Now implement the feature so the tests pass.

Do not change the tests unless the test itself is clearly wrong.
```

This project may start without a full test setup, but once tests exist, implementation should avoid bypassing them.

---

## Phase 4: Review

After implementation, Claude should summarize the result before commit.

The summary should include:

* what changed
* which files changed
* whether the implementation followed the approved plan
* what was intentionally not implemented
* known limitations
* how the change was tested

Example prompt:

```md
Summarize the implementation.

Include:
1. files changed
2. behavior added or changed
3. what was intentionally not implemented
4. how it was tested
5. any remaining risks or follow-up tasks
```

The human should review the diff before committing.

Useful commands:

```bash
git status
git diff --stat
git diff
```

---

## Phase 5: Commit

Commits should be small and meaningful.

Use Conventional Commits style when possible.

Examples:

```txt
docs: clarify MVP UI defaults
docs: add Claude development workflow
feat: add domain model types
feat: render static track library
feat: render track nodes on canvas
fix: handle missing audio URL
refactor: separate canvas node rendering
```

Before committing:

```bash
git status
git diff --stat
```

Then:

```bash
git add <files>
git commit -m "<message>"
```

Push after a coherent unit of work is committed.

---

## Pull Request Workflow

Pull requests should preserve the reason for the change.

Each PR description should include:

* User Prompt
* Summary
* Changes
* Out of Scope
* Testing

The `User Prompt` section should summarize the user's original request that led to the change.

Rules:

* Preserve the user's intent.
* Consolidate multiple conversation turns when needed.
* Do not add requirements the user did not ask for.
* Do not include unrelated chat logs.
* Do not include unnecessary emotional or personal context.
* If the PR intentionally does not cover part of the request, mention that under `Out of Scope`.

Recommended PR structure:

```md
## User Prompt

- Summarize the user's request here.

## Summary

- Summarize what changed in this PR.

## Changes

- List the main files, features, or behavior changed.

## Out of Scope

- List anything intentionally not implemented.

## Testing

- Describe how this was tested.
```

---

## Session Hygiene

Use one Claude session for one task when possible.

When switching tasks, use:

```txt
/clear
```

When a session becomes too long, ask Claude to update the plan file or summarize the current state before clearing.

Example:

```md
Update the current plan file with:
1. what has been completed
2. what remains
3. important decisions made
4. commands or tests already run
```

Then clear the session and resume from the plan file.

---

## Failure Recovery

If Claude fails once, ask it to analyze the failure and propose a correction.

If Claude repeats the same failed approach, do not keep pushing in the same context.

Use one of:

```txt
/rewind
/clear
```

Use `/rewind` when the bad direction started at a clear point.

Use `/clear` when the session is generally polluted, too long, or confused.

After `/clear`, restart with:

* `CLAUDE.md`
* relevant docs
* the saved plan file
* a precise next instruction

---

## Plans Directory

Use `docs/plans/` for approved implementation plans.

Plan files should be created for:

* new features
* architecture changes
* multi-step refactors
* storage changes
* audio engine changes
* complex UI behavior

Plan files do not need to be perfect. They need to preserve enough context to resume work safely.

Suggested format:

```md
# Plan: <task name>

## User Request

## Current State

## Goal

## Implementation Steps

## Files to Change

## Out of Scope

## Testing

## Risks
```

---

## Decision Logs

Use `docs/10_decision_log.md` for durable design decisions.

Store:

* what was decided
* why it was decided
* what was deferred
* any important constraints

Do not store full chat logs.

Do not store every Claude summary.

The decision log should preserve reasoning, not conversation noise.

---

## What Not To Do

Do not:

* ask Claude to implement a large feature without a plan
* let Claude invent unclear requirements
* let Claude add future features during MVP work
* keep working in a polluted session
* store full conversation logs as project documentation
* put every process rule into `CLAUDE.md`
* use advanced automation before the basic workflow is stable

---

## Current Project-Specific Rule

For this project, implementation should follow the order defined in `CLAUDE.md`.

The current MVP implementation order is:

1. Create domain types.
2. Create mock project data.
3. Render a static track library.
4. Render a static canvas.
5. Render nodes from mock data.
6. Render edges from mock data.
7. Add node selection.
8. Add "Add to Canvas" button in the Track Library.
9. Add edge creation using the MVP connection flow.
10. Add drag to reposition nodes on the canvas.
11. Add project JSON export/import.
12. Add simple audio playback.
13. Add crossfade using TransitionEdge.

Do not skip ahead to audio, AI, Spotify, Suno, backend, accounts, or cloud features during early MVP implementation.
