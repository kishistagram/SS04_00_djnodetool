// PlayerControls: play the selected node's sound, or play the selected edge's
// transition, and stop playback.
//
// Phase 8/9: it only triggers high-level callbacks; it knows nothing about the
// AudioEngine, oscillators, gains, or the AudioContext. The display switches on
// what is selected:
// - node selected:    Play / Stop
// - edge selected:    Play transition / Stop
// - nothing selected: Play disabled (Stop stays enabled so a running sound can
//                     always be stopped)

import type { TransitionEdge, TrackNode } from "../domain/types";

type PlayerControlsProps = {
  selectedNode: TrackNode | null;
  selectedEdge: TransitionEdge | null;
  // The edge's source/target nodes, resolved by App (null if not found).
  sourceNode: TrackNode | null;
  targetNode: TrackNode | null;
  onPlayNode: (node: TrackNode) => void;
  onPlayTransition: (
    edge: TransitionEdge,
    sourceNode: TrackNode,
    targetNode: TrackNode,
  ) => void;
  onStop: () => void;
};

function PlayerControls({
  selectedNode,
  selectedEdge,
  sourceNode,
  targetNode,
  onPlayNode,
  onPlayTransition,
  onStop,
}: PlayerControlsProps) {
  // An edge can only be played when both of its nodes were found.
  const canPlayTransition =
    selectedEdge !== null && sourceNode !== null && targetNode !== null;

  let playButton;
  let status;
  if (selectedEdge) {
    playButton = (
      <button
        type="button"
        className="player-button"
        disabled={!canPlayTransition}
        onClick={() => {
          if (canPlayTransition) {
            onPlayTransition(selectedEdge, sourceNode, targetNode);
          }
        }}
      >
        Play transition
      </button>
    );
    status = canPlayTransition
      ? `Transition: ${sourceNode.label} → ${targetNode.label} (${selectedEdge.transitionType})`
      : "Transition unavailable";
  } else {
    playButton = (
      <button
        type="button"
        className="player-button"
        disabled={!selectedNode}
        onClick={() => {
          if (selectedNode) {
            onPlayNode(selectedNode);
          }
        }}
      >
        Play
      </button>
    );
    status = selectedNode
      ? `Selected: ${selectedNode.label}`
      : "Nothing selected";
  }

  return (
    <div className="player-controls">
      {playButton}
      <button type="button" className="player-button" onClick={onStop}>
        Stop
      </button>
      <span className="player-status">{status}</span>
    </div>
  );
}

export default PlayerControls;
