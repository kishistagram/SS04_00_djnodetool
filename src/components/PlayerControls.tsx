// PlayerControls: play or stop the currently selected node's sound.
//
// Phase 8: it only triggers high-level callbacks (onPlay / onStop). It does not
// know anything about the AudioEngine, oscillators, frequencies, or waveforms;
// App wires these callbacks to the engine. Play is disabled when no node is
// selected.

import type { TrackNode } from "../domain/types";

type PlayerControlsProps = {
  selectedNode: TrackNode | null;
  onPlay: (node: TrackNode) => void;
  onStop: () => void;
};

function PlayerControls({ selectedNode, onPlay, onStop }: PlayerControlsProps) {
  return (
    <div className="player-controls">
      <button
        type="button"
        className="player-button"
        disabled={!selectedNode}
        onClick={() => {
          if (selectedNode) {
            onPlay(selectedNode);
          }
        }}
      >
        Play
      </button>
      <button type="button" className="player-button" onClick={onStop}>
        Stop
      </button>
      <span className="player-status">
        {selectedNode ? `Selected: ${selectedNode.label}` : "No node selected"}
      </span>
    </div>
  );
}

export default PlayerControls;
