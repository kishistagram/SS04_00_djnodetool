// TrackNode renders a single node as a card on the canvas.
//
// Phase 3: node selection. The card is absolutely positioned using the
// node's x/y (CSS pixels from the canvas top-left) and a fixed size. It
// shows the node label and the linked track's artist (if available).
// Clicking it selects the node; when selected it shows a highlight.

import type { Track, TrackNode as TrackNodeType } from "../domain/types";
import { NODE_WIDTH, NODE_HEIGHT } from "./canvasLayout";

type TrackNodeProps = {
  node: TrackNodeType;
  track?: Track;
  isSelected: boolean;
  onSelect: () => void;
};

function TrackNode({ node, track, isSelected, onSelect }: TrackNodeProps) {
  return (
    <div
      className={isSelected ? "track-node selected" : "track-node"}
      style={{
        left: node.x,
        top: node.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        borderColor: node.color,
      }}
      onClick={(event) => {
        // Stop the click from reaching the canvas background, which would
        // otherwise immediately deselect this node.
        event.stopPropagation();
        onSelect();
      }}
    >
      <span className="track-node-label">{node.label}</span>
      {track?.artist && (
        <span className="track-node-artist">{track.artist}</span>
      )}
    </div>
  );
}

export default TrackNode;
