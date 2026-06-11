// TrackLibrary renders the list of tracks from Project.tracks.
//
// Phase 4: each entry now has an "Add to Canvas" button. Clicking it asks
// the parent (App) to create a new node from that track via onAddToCanvas.
// The library itself stays presentational; it does not own project state.

import type { Track } from "../domain/types";

type TrackLibraryProps = {
  tracks: Track[];
  onAddToCanvas: (trackId: string) => void;
};

function TrackLibrary({ tracks, onAddToCanvas }: TrackLibraryProps) {
  return (
    <aside className="track-library">
      <h2>Track Library</h2>
      <ul className="track-list">
        {tracks.map((track) => (
          <li key={track.id} className="track-item">
            <span className="track-title">{track.title}</span>
            {track.artist && (
              <span className="track-artist">{track.artist}</span>
            )}
            {track.bpm !== undefined && (
              <span className="track-bpm">{track.bpm} BPM</span>
            )}
            <button
              type="button"
              className="add-to-canvas-button"
              onClick={() => onAddToCanvas(track.id)}
            >
              Add to Canvas
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default TrackLibrary;
