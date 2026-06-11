# Implementation Log

## 2026-06-11: Phase 0 - Vite React TypeScript Scaffold

### Summary

Phase 0 set up the frontend application foundation for NodeMix Canvas.

The project was scaffolded as a Vite + React + TypeScript application. The default Vite demo content was removed and replaced with a minimal NodeMix Canvas placeholder screen.

### Files Created

* `package.json`
* `package-lock.json`
* `index.html`
* `vite.config.ts`
* `eslint.config.js`
* `tsconfig.json`
* `tsconfig.app.json`
* `tsconfig.node.json`
* `src/App.tsx`
* `src/main.tsx`
* `src/index.css`
* `public/favicon.svg`
* `public/icons.svg`

### Files Intentionally Not Modified

* `CLAUDE.md`
* `README.md`
* `LICENSE`
* `.gitignore`
* `docs/`
* `.github/`

### Files Removed

The default Vite demo files were removed:

* `src/App.css`
* `src/assets/`

### Important Configuration

`vite.config.ts` was updated for the exe.dev environment:

* `server.host: true`
* `server.allowedHosts: 'all'`

### Verification

The development server started successfully with no blocking errors.

```bash
npm run dev
```

Vite started cleanly and reported that the dev server was ready.

### Notes

This phase only created the frontend project foundation. It did not implement domain models, mock data, canvas UI, audio playback, storage, or any product features.

The next implementation step is to add the core domain types and initial mock project data.


## 2026-06-11: Phase 0 - Vite React TypeScript Scaffold

### Summary

Set up the initial frontend foundation using Vite, React, and TypeScript.

The scaffold was created in `/tmp` first, reviewed, then copied into the project root while preserving existing project files such as `README.md`, `.gitignore`, `CLAUDE.md`, `docs/`, and `.github/`.

### Files Added

* `package.json`
* `package-lock.json`
* `index.html`
* `vite.config.ts`
* `eslint.config.js`
* `tsconfig.json`
* `tsconfig.app.json`
* `tsconfig.node.json`
* `src/App.tsx`
* `src/main.tsx`
* `src/index.css`
* `public/favicon.svg`
* `public/icons.svg`

### Files Removed

Removed default Vite demo files:

* `src/App.css`
* `src/assets/`

### Fix Applied

Changed `vite.config.ts`:

```ts
allowedHosts: 'all'
```

to:

```ts
allowedHosts: true
```

Reason: Vite 8 expects `allowedHosts` to be `true` or `string[]`. The string literal `'all'` caused `npm run build` to fail during TypeScript checking.

### Verification

* `git status`: only new scaffold files; no existing tracked files modified
* `git diff --stat`: no existing tracked file changes
* `npm run build`: passed
* `npm run lint`: passed
* `npm run dev`: started successfully

### Status

Phase 0 is ready to commit.

Next step: add domain types and mock project data.


## 2026-06-11: Phase 1 - Domain Types and Mock Project Data

### Summary

Phase 1 created the core domain data layer for NodeMix Canvas.

No UI, audio, or storage features were added. This phase only defined
the data model and a small sample project so later phases have something
to render and manipulate.

The types and mock data follow `docs/04_domain_model.md` exactly.

### Files Created

* `src/domain/types.ts`
* `src/domain/mockProject.ts`

### Files Intentionally Not Modified

* `src/App.tsx` (the screen is unchanged in Phase 1)
* `src/main.tsx`
* `src/index.css`
* `CLAUDE.md`, `README.md`, `LICENSE`, `.gitignore`, `.github/`

### What Was Implemented

`src/domain/types.ts` defines the core domain types:

* `Track`
* `TrackNode`
* `TransitionType` (`"cut" | "fade" | "crossfade"`)
* `TransitionEdge`
* `Project`

The types are pure data and do not import React or any UI library, so the
domain model stays independent and JSON-serializable.

`src/domain/mockProject.ts` defines `mockProject`, a small sample graph:

* 2 tracks (Night Drive, Blue Memory)
* 2 nodes
* 1 crossfade edge

Mock IDs use human-readable strings such as `"track-001"`. Runtime-created
entities will use `crypto.randomUUID()` in later phases.

### Verification

```bash
npm run build   # tsc -b && vite build
npm run lint    # eslint .
```

Results:

* `npm run build`: passed (16 modules, 0 errors)
* `npm run lint`: passed (no warnings, no errors)
* `git status`: only new files under `src/domain/`; no existing tracked files modified
* `git diff --stat`: empty

### Notes

This phase did not render anything. `mockProject` is exported but not yet
imported anywhere; it will be consumed by the Track Library and Canvas in
the next phase.

The next implementation step is to render a static Track Library and a
static Canvas from this mock data.
