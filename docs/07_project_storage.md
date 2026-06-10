# Project Storage

## Goal

The user can save the current project as a JSON file and reload it later.

Storage is local and browser-based. No backend or cloud storage is used in the MVP.

## Export

To export the project:

1. Serialize the current project state using `JSON.stringify`.
2. Use two-space indentation for human readability.
3. Trigger a browser file download using a temporary `<a>` element with a `blob:` URL.
4. Use the filename `<project-title>.json`.

The exported file contains the full `Project` object as JSON.

## Import

To import a project:

1. Open a browser file picker using an `<input type="file" accept=".json">` element.
2. Read the selected file using the `FileReader` API.
3. Parse the file contents with `JSON.parse`.
4. Validate that the parsed object contains the required top-level fields: `id`, `title`, `tracks`, `nodes`, `edges`.
5. Replace the current project state with the loaded project.

If the file cannot be parsed or is missing required fields, show a simple error message. Do not change the current project state.

## JSON Structure

The saved JSON matches the `Project` TypeScript type exactly.

No React-specific state (such as selection state or UI mode) is included in the saved file.

### Full Project Example

```json
{
  "id": "project-001",
  "title": "Late Night Prototype Mix",
  "tracks": [
    {
      "id": "track-001",
      "title": "Night Drive",
      "artist": "Sample Artist",
      "bpm": 110,
      "durationSec": 180,
      "audioUrl": "/audio/night-drive.mp3",
      "tags": ["night", "drive", "smooth"]
    }
  ],
  "nodes": [
    {
      "id": "node-001",
      "trackId": "track-001",
      "x": 100,
      "y": 160,
      "label": "Night Drive",
      "color": "#3B82F6"
    }
  ],
  "edges": [
    {
      "id": "edge-001",
      "fromNodeId": "node-001",
      "toNodeId": "node-002",
      "transitionType": "crossfade",
      "fadeDurationSec": 5,
      "note": "smooth late-night transition"
    }
  ],
  "createdAt": "2026-06-10T00:00:00.000Z",
  "updatedAt": "2026-06-10T00:00:00.000Z"
}
```

## Serialization Rules

- The JSON structure must match the `Project` TypeScript type.
- `audioUrl` values are stored as-is. Relative paths are not resolved before saving.
- `color` values are stored as CSS hex strings, for example `"#3B82F6"`.
- `createdAt` and `updatedAt` are ISO 8601 strings.
- Optional fields that are `undefined` may be omitted from the JSON output.
- `tags` is always present on `Track` but may be an empty array.

## ID Stability

Entity IDs are stable across export and import cycles.

IDs in mock data use human-readable strings such as `"track-001"`.

IDs created at runtime use `crypto.randomUUID()`.

## Limitations

The MVP does not support:
- auto-save
- undo/redo
- multiple projects open at the same time
- merging two project files
- cloud sync or remote storage
