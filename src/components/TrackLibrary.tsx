// TrackLibrary renders the list of tracks from Project.tracks.
//
// Phase 2: static display only. Each entry shows the title, artist (if
// available), and BPM (if available). The "Add to Canvas" button is not
// part of this phase.

import type { Track } from "../domain/types";

type TrackLibraryProps = {
  tracks: Track[];
};

function TrackLibrary({ tracks }: TrackLibraryProps) {
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
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default TrackLibrary;
