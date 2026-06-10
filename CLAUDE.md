# CLAUDE.md

## Project

This project is called NodeMix Canvas.

It is a node-based music arrangement and DJ prototype.

The goal is to let users place tracks on a free-form canvas, connect them with transition edges, and play simple transitions between connected tracks.

## Important Instruction

Before writing code, always read the files in the `docs/` directory.

Start with:

- `docs/00_product_vision.md`
- `docs/02_mvp_scope.md`
- `docs/04_domain_model.md`
- `docs/06_audio_engine_requirements.md`

Some docs may contain only TODO placeholders. Treat those as intentionally unfinished.

For now, use these files as the source of truth:

- `docs/00_product_vision.md`
- `docs/02_mvp_scope.md`
- `docs/04_domain_model.md`
- `docs/06_audio_engine_requirements.md`
- `CLAUDE.md`

Do not invent requirements from unfinished TODO files.

After reading the docs, summarize your understanding before making major implementation changes.

## Development Philosophy

Prioritize:

- small steps
- readable code
- clear architecture
- understandable implementation
- explicit data structures
- maintainability
- learning value

Do not prioritize:

- feature quantity
- visual polish too early
- unnecessary libraries
- premature backend work
- complex AI behavior
- streaming service integration

## Technical Direction

Use:

- React
- TypeScript
- frontend-only architecture for MVP
- local mock data
- local JSON save/load
- Web Audio API for simple playback

Do not add a backend unless explicitly requested.

## Suggested Directory Structure

```txt
src/
  domain/
    types.ts
    mockProject.ts

  audio/
    audioEngine.ts

  components/
    TrackLibrary.tsx
    NodeCanvas.tsx
    TrackNode.tsx
    EdgeView.tsx
    PlayerControls.tsx
    InspectorPanel.tsx

  storage/
    projectStorage.ts

  App.tsx
  main.tsx
```

This structure can be adjusted, but do not mix all logic into one large file.

## Architecture Rules

### Domain

Domain types should live in:

```txt
src/domain/
```

The domain model should not depend on React.

Core domain entities:

- Track
- TrackNode
- TransitionEdge
- Project

### UI

UI components should live in:

```txt
src/components/
```

React components should be small and focused.

Avoid putting audio engine logic directly inside UI components.

### Audio

Audio logic should live in:

```txt
src/audio/
```

Use Web Audio API only for simple playback and crossfade in the MVP.

### Storage

Project save/load logic should live in:

```txt
src/storage/
```

Project data should be serializable as JSON.

## MVP Features

Build only these features first:

- Track library
- Canvas display
- Track nodes
- Transition edges
- Node selection
- Simple project JSON save/load
- Simple playback
- Simple crossfade

## Out of Scope for MVP

Do not implement these unless explicitly requested:

- Spotify integration
- Suno integration
- Apple Music integration
- YouTube integration
- backend server
- authentication
- cloud sync
- database
- AI editing
- natural language editing
- BPM auto-detection
- beat matching
- pitch shifting
- time stretching
- waveform editor
- social sharing
- payment features
- mobile app

## Implementation Rules

When asked to implement something:

1. State what you will change.
2. Keep the change small.
3. Do not modify unrelated files.
4. Do not add features outside the request.
5. Explain the changed files after implementation.
6. Mention any trade-offs or shortcuts.

## Code Quality Rules

- Use TypeScript types.
- Avoid `any` unless there is a clear reason.
- Avoid large components.
- Separate domain logic from UI logic.
- Keep functions small.
- Prefer explicit names.
- Do not hide important behavior in unclear helper functions.
- Add comments only when they explain non-obvious behavior.

## AI Behavior Rules

Do not make large architectural changes without explaining them first.

Do not replace the project structure without permission.

Do not add new major dependencies without explaining why.

Do not implement future features just because they seem useful.

If the request is ambiguous, choose the smallest reasonable implementation and explain the assumption.

## First Implementation Order

Follow this order unless instructed otherwise:

1. Create domain types.
2. Create mock project data.
3. Render a static track library.
4. Render a static canvas.
5. Render nodes from mock data.
6. Render edges from mock data.
7. Add node selection.
8. Add drag movement.
9. Add edge creation.
10. Add project JSON export/import.
11. Add simple audio playback.
12. Add crossfade using TransitionEdge.

## Definition of Done for MVP

The MVP is complete when:

- A user can see tracks in a library.
- A user can see tracks as nodes on a canvas.
- A user can connect nodes.
- A user can define a simple transition.
- A user can play a basic transition.
- A user can save and load the project as JSON.
- The code structure is understandable.