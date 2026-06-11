// EdgeView renders a single transition edge as an SVG line with an
// arrowhead, drawn from the center of the source node to the center of
// the target node.
//
// Phase 2: static display only. It receives the resolved from/to nodes
// and computes their centers using the fixed node size.

import type { TrackNode } from "../domain/types";
import { NODE_WIDTH, NODE_HEIGHT } from "./canvasLayout";

type EdgeViewProps = {
  fromNode: TrackNode;
  toNode: TrackNode;
  // Shared SVG marker id for the arrowhead, defined once by NodeCanvas.
  markerId: string;
};

function nodeCenter(node: TrackNode) {
  return {
    x: node.x + NODE_WIDTH / 2,
    y: node.y + NODE_HEIGHT / 2,
  };
}

function EdgeView({ fromNode, toNode, markerId }: EdgeViewProps) {
  const from = nodeCenter(fromNode);
  const to = nodeCenter(toNode);

  return (
    <line
      className="edge-line"
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      markerEnd={`url(#${markerId})`}
    />
  );
}

export default EdgeView;
