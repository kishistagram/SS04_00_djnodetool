// TrackNode renders a single node as a card on the canvas.
//
// Phase 2: static display only. The card is absolutely positioned using
// the node's x/y (CSS pixels from the canvas top-left) and a fixed size.
// It shows the node label and the linked track's artist (if available).

import type { Track, TrackNode as TrackNodeType } from "../domain/types";
import { NODE_WIDTH, NODE_HEIGHT } from "./canvasLayout";

type TrackNodeProps = {
  node: TrackNodeType;
  track?: Track;
};

function TrackNode({ node, track }: TrackNodeProps) {
  return (
    <div
      className="track-node"
      style={{
        left: node.x,
        top: node.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        borderColor: node.color,
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
