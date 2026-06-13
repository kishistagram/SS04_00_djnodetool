# Decision Log

## 2026-06-10: MVP Interaction Decisions

### Context

Claude reviewed `CLAUDE.md` and the files in `docs/`.

It identified several ambiguous areas in the MVP design, especially around:

- how tracks are added to the canvas
- how edges are created
- how playback starts
- how multiple outgoing edges are handled
- how fade and crossfade differ
- how project storage should work

These decisions were made before implementation to prevent Claude from inventing behavior during coding.

---

## Decisions

### 1. Track-to-canvas interaction

Decision:

- v0.1: render nodes from mock data only.
- v0.2: add an "Add to Canvas" button in the Track Library.
- v0.3 or later: support drag-and-drop from Track Library to Canvas.

Reason:

Drag-and-drop is part of the long-term product vision, but it adds UI complexity too early.  
The MVP should first prove the data model and node graph structure.

---

### 2. Edge creation

Decision:

Use a simple two-step interaction:

1. Select a source node.
2. Click "Start Connection".
3. Click a target node.
4. Create a directed edge from source to target.

Reason:

Drag-to-connect is more visually natural, but it is more complex.  
The first version should prioritize understandable implementation.

---

### 3. Playback target

Decision:

- A selected node can be played with "Play Track".
- A selected edge can be played with "Play Transition".
- If a node has multiple outgoing edges, the app should not choose automatically.

Reason:

Automatic edge selection would hide user intention.  
A DJ-style tool should let the user choose the transition explicitly.

---

### 4. Transition semantics

Decision:

- `cut`: stop the first track immediately and start the second track.
- `fade`: fade out the first track, then start the second track.
- `crossfade`: fade out the first track while fading in the second track at the same time.

Reason:

This keeps each transition type distinct and easy to implement.

---

### 5. fadeDurationSec

Decision:

- Keep `fadeDurationSec` required.
- For `cut`, use `fadeDurationSec: 0`.
- For `fade` and `crossfade`, use a positive number.

Reason:

Keeping the field required simplifies the data model.  
The meaning for `cut` is handled by convention.

---

### 6. Track library

Decision:

For the MVP, `Project.tracks` is the track library.

Reason:

A separate global library would add complexity before it is needed.

---

### 7. audioUrl

Decision:

- `audioUrl` is optional.
- Early UI steps must work without real audio files.
- Real audio files will be added only when implementing playback.

Reason:

The UI and graph model can be built before audio playback.  
This avoids blocking early development on audio file preparation.

---

### 8. TrackNode.label

Decision:

- Initialize `TrackNode.label` from `Track.title`.
- Do not implement node renaming in the MVP.
- Keep `label` for future flexibility.

Reason:

Eventually, a node may need a custom label independent of the original track title.  
For now, the UI does not need rename behavior.

---

### 9. TrackNode.color

Decision:

- Use mock colors or automatic colors.
- Do not implement color editing in the MVP.

Reason:

Color is useful for visual distinction, but color editing is not core to the first prototype.

---

### 10. Canvas coordinates

Decision:

`x` and `y` are CSS pixel coordinates relative to the top-left corner of the canvas.

Reason:

This is the simplest coordinate system for the MVP.

---

### 11. ID generation

Decision:

Use `crypto.randomUUID()` for runtime-created entities.

Reason:

It is built into modern browsers and avoids manual counter logic.

---

### 12. AudioEngine access pattern

Decision:

Create one AudioEngine instance at the app level and pass it to components through props.

Reason:

React Context is unnecessary until the app grows.  
Props are easier to understand for the first implementation.

---

## Deferred Features

These are intentionally not implemented in the MVP:

- drag-and-drop from track library
- drag-to-connect edges
- node renaming
- color editing
- BPM detection
- beat matching
- waveform display
- Spotify integration
- Suno integration
- AI-assisted editing
- backend
- accounts
- cloud sync

---

## Next Step

Update the following docs based on these decisions:

- `docs/05_ui_requirements.md`
- `docs/07_project_storage.md`

Then proceed to implementation step 1:

- create `src/domain/types.ts`

## 2026-06-10: Node Placement and Edge Defaults

> Note (2026-06-11): This section originally appeared twice as two near-duplicate
> entries with the same title. They have been merged into this single entry. The
> node-placement formula recorded here was a pre-implementation plan; the value
> actually shipped differs (see "Implementation note" below and the Phase 4 entry).

### Context

After reviewing the MVP docs, a few remaining ambiguities were clarified before
writing application code. The main open questions were:

- where newly added nodes should appear on the canvas
- what default values should be used when creating a new transition edge

### Decisions

#### 1. Default placement for newly added nodes

When the user clicks "Add to Canvas", the new node is placed automatically using
a simple deterministic rule.

- The first node starts near the top-left of the canvas.
- Additional nodes are offset from previous nodes to avoid full overlap.
- Coordinates are CSS pixels relative to the top-left corner of the canvas.

Originally planned formula (grid layout):

```ts
x = 120 + (nodeCount % 5) * 80;
y = 120 + Math.floor(nodeCount / 5) * 80;
```

This is MVP-only behavior. Advanced layout, zoom-aware placement,
center-of-canvas placement, and drag-and-drop placement are deferred.

**Implementation note (2026-06-11, Phase 4):** the shipped code uses a simpler
diagonal offset instead of the grid formula above:

```ts
x = 200 + nodes.length * 30;
y = 200 + nodes.length * 30;
```

The diagonal offset was chosen during implementation because it is trivial to
read and good enough to keep repeated additions from fully overlapping. The grid
formula above is kept only as the original plan, not as the current behavior.
See the Phase 4 entry for the authoritative decision.

#### 2. Default values for new edges

When a new edge is created, use:

- transitionType: "crossfade"
- fadeDurationSec: 3
- note: undefined

Rules for `fadeDurationSec`:

- If transitionType is changed to `"cut"`, set `fadeDurationSec` to 0.
- If transitionType is changed to `"fade"` or `"crossfade"` and `fadeDurationSec`
  is 0, reset it to a positive number (3).

**Status:** Not implemented yet. Edge creation is MVP step 9; these defaults
apply once that step is built. They are recorded here as the agreed defaults,
not as current behavior.

### Deferred

The following are not implemented yet:

- drag-and-drop placement from the track library
- advanced auto-layout
- zoom-aware canvas behavior
- audio file selection
- real audio playback

## 2026-06-11: Phase 1 Implementation Decisions

### Context

Phase 1 implemented the domain data layer (`src/domain/types.ts` and
`src/domain/mockProject.ts`). A few small decisions were made while turning
the `docs/04_domain_model.md` definitions into actual files.

### Decisions

#### 1. Split types and mock data into two files

Decision:

* Put type definitions in `src/domain/types.ts`.
* Put the sample project in `src/domain/mockProject.ts`.

Reason:

This matches the suggested directory structure in `CLAUDE.md` and keeps
the type definitions separate from sample data, so mock data can change
without touching the types.

#### 2. Import the Project type with `import type`

Decision:

`mockProject.ts` uses `import type { Project } from "./types"`.

Reason:

The import is only needed for type-checking, not at runtime. Using
`import type` makes that intent explicit and keeps the domain layer free
of unnecessary runtime imports.

#### 3. Do not modify the UI in Phase 1

Decision:

`src/App.tsx` was left unchanged. The mock data is exported but not yet
rendered.

Reason:

Phase 1 is strictly the data layer. Keeping the change small makes it easy
to review and avoids mixing data-model work with UI work. Rendering begins
in the next phase.

#### 4. Copy mock data verbatim from the domain model doc

Decision:

The contents of `mockProject` (tracks, nodes, edge) were taken directly
from the Example Project in `docs/04_domain_model.md` rather than invented.

Reason:

`CLAUDE.md` instructs not to invent requirements. The doc already provides
an agreed-upon sample, so reusing it keeps a single source of truth.

## 2026-06-11: Phase 2 Implementation Decisions

### Context

Phase 2 rendered the Track Library and Node Canvas statically from
`mockProject`. A few small decisions were made while building the first
UI components.

### Decisions

#### 1. Render only Library + Canvas (no Inspector/Player placeholders)

Decision:

Phase 2 renders only the Track Library and Node Canvas. The Inspector
Panel and Player Controls regions are not added yet, not even as empty
placeholders.

Reason:

This keeps the change minimal and focused on "data to pixels". The full
four-region layout will come as those regions get real behavior.

#### 2. Fixed node size via a shared constants file

Decision:

Node size is fixed at 140x60, defined in `src/components/canvasLayout.ts`
and shared by `TrackNode` (rendering) and `EdgeView` (line geometry).

Reason:

Edges need to compute node centers to draw lines. A shared constant keeps
the rendered card and the edge math in sync without measuring the DOM.
Variable node sizes are unnecessary for the MVP.

#### 3. Edges as an SVG layer behind the nodes

Decision:

Edges are drawn in a single SVG layer positioned absolutely behind the
node cards, using a line from source-center to target-center plus a shared
arrowhead marker for direction. The SVG layer uses `pointer-events: none`.

Reason:

SVG is the simplest way to draw directional lines and arrowheads. Putting
it behind the nodes keeps the cards readable, and disabling pointer events
ensures it will not interfere with node interactions in later phases.

#### 4. No React state in Phase 2

Decision:

Data flows from `App` down through plain props. No `useState` or event
handlers are introduced.

Reason:

Phase 2 is pure static rendering. State belongs with selection (Phase 3),
where it is actually needed. Keeping it out now makes the rendering layer
simple to read.

## 2026-06-11: Phase 3 Implementation Decisions

### Context

Phase 3 added node selection and the Inspector Panel. The work was scoped
to node selection only (option A). A few small decisions were made while
introducing the first React state.

### Decisions

#### 1. Node selection only (option A)

Decision:

Implement node selection and a read-only node Inspector. Do not implement
edge selection, the editable edge inspector, edge editing, node dragging,
or the "Start Connection" button.

Reason:

This keeps the change small and matches the branch scope. The edge
inspector is an editable form (transitionType, fadeDurationSec, note) and
is naturally its own step. Selection alone is enough to introduce React
state cleanly.

#### 2. Selection state lives in App

Decision:

`selectedNodeId: string | null` is held in `App` with `useState` and
passed down through props (`selectedNodeId`, `onSelectNode`, `onDeselect`).

Reason:

`App` is the common parent of the canvas (which changes the selection) and
the inspector (which reads it). Per `CLAUDE.md`, props are preferred over
React Context until prop drilling becomes unmanageable, which it has not.

#### 3. Store only the id, not the node object

Decision:

State stores `selectedNodeId` (a string), not the selected node object.
Components look the node up by id.

Reason:

The id is the stable source of truth. Storing only the id avoids keeping a
duplicate copy of node data in state that could drift from the project
data, which matters once nodes become editable in later phases.

#### 4. Stop click propagation on the node

Decision:

A node's click handler calls `event.stopPropagation()` before selecting.

Reason:

The canvas background has a click handler that deselects. Without stopping
propagation, a node click would bubble to the canvas and immediately
deselect the node. Stopping propagation lets node clicks select and
background clicks deselect, exactly as the selection model requires.

#### 5. Inspector fields are read-only

Decision:

The Inspector shows label, track, artist, position, and color as
read-only text. The "Start Connection" button is not included yet.

Reason:

The MVP decision log already states node rename and color editing are out
of scope, and "Start Connection" belongs to edge creation (Phase 5).

## 2026-06-11: Phase 4 Implementation Decisions

### Context

Phase 4 added the "Add to Canvas" button to the Track Library. Clicking it
creates a new node from a track and places it on the canvas. The scope was
node creation only (no deletion, dragging, or edge creation).

### Decisions

#### 1. Project becomes state in App

Decision:

The whole project is now held in `App` with `useState<Project>(mockProject)`
instead of referencing `mockProject` directly.

Reason:

Adding a node must change `project.nodes` at runtime. Holding the project in
state is the smallest change that makes the data mutable, and it sets up the
later "drag to reposition" step (Phase 4.x), which also writes node x/y back
into the project.

#### 2. Node creation lives in App, library stays presentational

Decision:

`handleAddToCanvas(trackId)` is defined in `App`. `TrackLibrary` only calls
`onAddToCanvas(track.id)` and does not own any project state.

Reason:

`App` owns the project, so the entity that creates nodes belongs there. The
library stays a simple presentational component, consistent with the Phase 3
data flow.

#### 3. Runtime node ids use crypto.randomUUID()

Decision:

New nodes get `id: crypto.randomUUID()`, not the `"node-00N"` format used by
the mock data.

Reason:

This matches the existing comment in `types.ts`/`mockProject.ts`: hand-written
mock entities use readable ids, but runtime-created entities use
`crypto.randomUUID()` to guarantee uniqueness without tracking a counter.

#### 4. Simple fixed offset for placement (no auto-layout)

Decision:

New nodes are placed at `x: 200 + nodes.length * 30`, `y: 200 + nodes.length * 30`.

Reason:

A real auto-layout is out of scope. The fixed offset is just enough to keep
repeated additions from fully overlapping, while staying trivial to read.

#### 5. Default node color for created nodes

Decision:

Created nodes use a single default color (`#64748B`). The source track has no
color of its own.

Reason:

`TrackNode.color` is optional and tracks do not carry a color. A neutral
default keeps the visuals consistent without inventing per-track colors, which
would be a separate feature.

#### 6. Same track may be added multiple times

Decision:

There is no guard against adding the same track to the canvas more than once.

Reason:

Placing the same track at multiple points in a mix is a natural DJ use case,
and the fixed offset keeps duplicates visually distinct.

### Follow-up (not implemented in Phase 4)

* **Node deletion is not implemented in Phase 4.** A node can be created and
  selected but not removed. Deletion is handled separately in Phase 4.5
  ("Delete selected node"), which also removes any edges connected to the
  deleted node.

## 2026-06-11: Phase 4.5 Implementation Decisions

### Context

Phase 4.5 added node deletion, the follow-up flagged at the end of Phase 4.
It is a small, separate phase so the history stays "1 phase = 1 PR" and the
delete logic does not mix into the Add to Canvas change.

### Decisions

#### 1. Delete UI lives in the Inspector Panel

Decision:

The first delete affordance is a "Delete node" button in the Inspector Panel,
shown only when a node is selected.

Reason:

The Inspector already represents "the currently selected node", so it is the
natural home for actions on that node. Showing the button only when a node is
selected keeps the UI honest: there is nothing to delete otherwise.

#### 2. Deleting a node also deletes its connected edges

Decision:

`handleDeleteNode` removes the node from `project.nodes` and also removes any
edge whose `fromNodeId` or `toNodeId` equals the deleted node id.

Reason:

An edge that points at a missing node is invalid data (a dangling edge). There
are no edge-creation features yet, but mock data already contains an edge, and
future phases add more. Cleaning up edges here keeps the project always
consistent and avoids a class of bugs later. The field names `fromNodeId` /
`toNodeId` were taken directly from the `TransitionEdge` type in `types.ts`,
not assumed.

#### 3. Clear the selection after delete

Decision:

After deleting, `selectedNodeId` is set to `null`.

Reason:

The selected node no longer exists, so keeping its id selected would point at
nothing. Clearing the selection returns the Inspector to its "Select a node"
placeholder, which is the correct empty state.

#### 4. No keyboard, no drag-to-trash, no confirm dialog (yet)

Decision:

Delete/Backspace key support, drag-to-trash, and a confirmation dialog are not
included.

Reason:

The goal is the smallest correct delete. A button is enough to prove the data
flow. Keyboard shortcuts and confirmation are UX refinements that can be added
later if they prove necessary; adding them now would widen the scope.

## 2026-06-11: Phase 5 Implementation Decisions

### Context

Phase 5 added node dragging on the canvas. A node can be dragged to a new
position, and its x/y is written back into the project. The scope was dragging
only (no edge creation, import/export, audio, or crossfade).

### Decisions

#### 1. Native mouse events, no drag-and-drop library

Decision:

Use native `mousedown` / `mousemove` / `mouseup` events. Do not add a
drag-and-drop library.

Reason:

The MVP favors readable code and no unnecessary libraries. The interaction is
small enough to implement directly: select on mousedown, update x/y on
mousemove, stop on mouseup. The move/up listeners are attached to `window` so a
fast drag that leaves the node still tracks the pointer.

#### 2. Update the project on every mousemove (option 1)

Decision:

Each `mousemove` calls `onMoveNode`, which immutably replaces the dragged
node's x/y in `project.nodes` via `map`.

Reason:

This keeps a single source of truth (the project) and makes edges follow for
free. With only a handful of nodes, updating state per move is simple and fast
enough. A separate "drag buffer" state would be a premature optimization and
would duplicate the position.

#### 3. mousedown selects the node

Decision:

`mousedown` selects the node before starting the drag.

Reason:

Selecting on mousedown means starting a drag also selects, which matches user
expectation and keeps the Phase 3 selection behavior intact. It also lets the
Inspector show the node being moved.

#### 4. Suppress the click that follows a real drag

Decision:

A `didDrag` ref is set on the first mousemove. The subsequent `click` is
ignored when `didDrag` is true.

Reason:

The browser fires a `click` after `mouseup`. Without this guard, a drag would
also run the click's select logic. Selection already happened on mousedown, so
the trailing click should do nothing after a real drag. A plain click (no
movement) still selects normally.

#### 5. NodeCanvas owns the canvas ref

Decision:

`NodeCanvas` holds the canvas element via `useRef` and passes it to each
`TrackNode`. Nodes convert mouse coordinates to canvas space using
`getBoundingClientRect()` on that ref.

Reason:

Nodes must not query the DOM themselves (e.g. `document.querySelector`). Passing
the ref keeps ownership clear and the components decoupled from the DOM
structure.

#### 6. No coordinate clamping

Decision:

A node can be dragged anywhere, including negative or off-screen coordinates.

Reason:

Clamping to the canvas bounds is out of scope for the MVP. Allowing free
positions keeps the logic minimal; bounds handling can be added later if needed.

#### 7. EdgeView is unchanged

Decision:

`EdgeView` is not modified. Edges follow moved nodes automatically.

Reason:

`EdgeView` already derives its line endpoints from each node's x/y (center of
the fixed-size node). Updating a node's x/y is enough for connected edges to
re-render in the new position.
