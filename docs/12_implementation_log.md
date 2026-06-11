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


## 2026-06-11: Phase 2 - Static Track Library and Canvas

### Summary

Phase 2 rendered the mock project data on screen for the first time.

The app now shows a two-column layout: a Track Library on the left and a
Node Canvas on the right. The canvas displays track nodes positioned by
their x/y coordinates and the transition edge connecting them.

This phase is static rendering only. There is no selection, dragging,
edge creation, audio, or storage. No React state is used.

### Files Created

* `src/components/canvasLayout.ts` (shared NODE_WIDTH / NODE_HEIGHT)
* `src/components/TrackLibrary.tsx`
* `src/components/TrackNode.tsx`
* `src/components/EdgeView.tsx`
* `src/components/NodeCanvas.tsx`

### Files Modified

* `src/App.tsx` (imports mockProject, sets up the two-column layout)
* `src/index.css` (minimal layout styles for the panels, canvas, nodes, edges)

### Files Intentionally Not Modified

* `src/domain/types.ts`, `src/domain/mockProject.ts` (data layer unchanged)
* `CLAUDE.md`, `README.md`, `LICENSE`, `.gitignore`, `.github/`

### What Was Implemented

* `TrackLibrary` renders every track in `Project.tracks` with title,
  artist (if available), and BPM (if available). No "Add to Canvas" button.
* `TrackNode` renders one node as an absolutely positioned card using the
  node's x/y and a fixed size; the border uses `node.color`. It shows the
  node label and the linked track's artist.
* `EdgeView` renders one edge as an SVG line from the source node center
  to the target node center, with an arrowhead marker for direction.
* `NodeCanvas` renders the SVG edge layer behind and the node cards on top.
  Edges look up their from/to nodes by id; nodes look up their track by id.
* `App` owns `mockProject` and passes data down through plain props.

### Out of Scope (deferred to later phases)

* Node selection and click handling (Phase 3)
* "Add to Canvas" button (Phase 4)
* Edge creation / connection mode (Phase 5)
* Node dragging (Phase 6)
* Inspector Panel and Player Controls
* Audio and storage

### Verification

```bash
npm run build   # tsc -b && vite build
npm run lint    # eslint .
npm run dev     # visual check in the browser
```

Results:

* `npm run build`: passed (22 modules, 0 errors)
* `npm run lint`: passed (no warnings, no errors)
* `npm run dev`: rendered correctly. Both tracks appear in the library;
  both nodes appear on the canvas at their coordinates with their colors;
  the edge connects Night Drive -> Blue Memory with an arrowhead.

### Notes

Node size is fixed (140x60) via `canvasLayout.ts` so the edge geometry can
compute node centers. This is an MVP simplification; variable node sizes
are not needed yet.

The next implementation step is node selection (Phase 3), which will
introduce the first React state and the Inspector Panel.


## 2026-06-11: Phase 3 - Node Selection and Inspector Panel

### Summary

Phase 3 made the canvas interactive for the first time. Clicking a node
selects it (shown with a highlight); clicking the empty canvas background
deselects. The Inspector Panel on the left shows read-only details of the
selected node.

This phase introduced the first React state (`useState`) in the project.
Scope was node selection only (option A): edge selection, edge inspection,
edge editing, node dragging, and the "Start Connection" button were not
implemented.

### Files Created

* `src/components/InspectorPanel.tsx`

### Files Modified

* `src/App.tsx` (holds `selectedNodeId` state; lays out the left column
  with TrackLibrary + InspectorPanel; passes selection props down)
* `src/components/NodeCanvas.tsx` (node click selects; empty canvas click
  deselects; passes `isSelected` / `onSelect` to each node)
* `src/components/TrackNode.tsx` (accepts `isSelected` / `onSelect`; adds
  the selected highlight; stops click propagation so selecting a node does
  not also trigger the canvas deselect)
* `src/index.css` (left-column layout, selected-node highlight, inspector
  panel styles)

### Files Intentionally Not Modified

* `src/domain/*` (data layer unchanged)
* `src/components/EdgeView.tsx` (edges are not selectable in this phase)
* `CLAUDE.md`, `README.md`, `LICENSE`, `.gitignore`, `.github/`

### State and Data Flow

* `selectedNodeId: string | null` lives in `App` via `useState`.
* `App` passes `selectedNodeId`, `onSelectNode`, and `onDeselect` to
  `NodeCanvas`, and `selectedNodeId` to `InspectorPanel`.
* `NodeCanvas` calls `onSelectNode(node.id)` on a node click and
  `onDeselect()` on a background click.
* `TrackNode` calls `event.stopPropagation()` then `onSelect()` so its
  click does not bubble up to the canvas deselect handler.
* `InspectorPanel` finds the node by id and renders read-only fields, or a
  "Select a node" placeholder when nothing is selected.

### Out of Scope (deferred to later phases)

* Edge selection and the editable edge inspector form
* "Start Connection" button / edge creation (Phase 5)
* Node dragging (Phase 6)
* Node rename and color editing (read-only in the MVP)
* Player Controls, audio, and storage

### Verification

```bash
npm run build   # tsc -b && vite build
npm run lint    # eslint .
npm run dev     # manual check in the browser
```

Results:

* `npm run build`: passed (23 modules, 0 errors)
* `npm run lint`: passed (no warnings, no errors)
* `npm run dev`: verified in the browser:
  - Clicking a node highlights it and fills the Inspector (label, track,
    artist, position, color).
  - Clicking the empty canvas clears the selection and the Inspector shows
    "Select a node".
  - Clicking a different node switches the selection cleanly (the node
    click does not bubble to the canvas deselect).

### Notes

The inspector shows position and color as read-only, matching the MVP
decision that node rename and color editing are out of scope.

The next implementation step is the "Add to Canvas" button (Phase 4),
which will create new nodes at runtime and require the project's nodes to
become state rather than fixed mock data.

## 2026-06-11: Phase 4 - Add to Canvas (track-to-canvas node creation)

### Summary

Phase 4 made the project mutable for the first time. Each track in the Track
Library now has an "Add to Canvas" button. Clicking it creates a new node from
that track, appends it to the project, and selects the new node so its details
appear in the Inspector Panel.

### Files Modified

* `src/App.tsx` - project is now `useState<Project>(mockProject)`; added
  `handleAddToCanvas(trackId)`; aliased the `TrackNode` type to `TrackNodeData`
  to avoid colliding with the `TrackNode` component.
* `src/components/TrackLibrary.tsx` - added the `onAddToCanvas` prop and an
  "Add to Canvas" button per track.
* `src/index.css` - styling for `.add-to-canvas-button`.

### Files Intentionally Not Modified

* `src/domain/types.ts`, `src/domain/mockProject.ts` - the data model already
  supports runtime nodes; only the seed data is reused.
* `src/components/NodeCanvas.tsx`, `TrackNode.tsx`, `InspectorPanel.tsx` - they
  already render from props, so added nodes show up with no change.

### State and Data Flow

* `App` owns `project` (state) and `selectedNodeId` (state).
* `TrackLibrary` calls `onAddToCanvas(track.id)`.
* `handleAddToCanvas` looks up the track, builds a new `TrackNode`
  (`crypto.randomUUID()` id, default color `#64748B`, position
  `200 + nodes.length * 30`), appends it immutably via `setProject`, and sets
  it as the selected node.
* `NodeCanvas` and `InspectorPanel` re-render from the updated project.

### Out of Scope (deferred to later phases)

* **Node deletion** - handled separately in Phase 4.5.
* Drag to reposition nodes (writes x/y back to the project).
* Edge creation / "Start Connection".
* Project JSON import/export, audio playback, crossfade, localStorage.

### Verification

```
npm run build   # tsc -b && vite build
npm run lint    # eslint .
npm run dev     # manual check in the browser
```

Results:

* `npm run build`: passed (23 modules, 0 errors)
* `npm run lint`: passed (no warnings, no errors)
* `npm run dev`: verified in the browser:
  - Each track shows an "Add to Canvas" button.
  - Clicking it adds a node to the canvas, auto-selects it, and fills the
    Inspector with the new node's details.
  - The same track can be added multiple times; nodes are offset so they do
    not fully overlap.

### Notes

There is no way to remove a node yet. Node deletion is implemented next in
Phase 4.5 ("Delete selected node"), which adds a Delete button to the Inspector
Panel and also removes edges connected to the deleted node.
