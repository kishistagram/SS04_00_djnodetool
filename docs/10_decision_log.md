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