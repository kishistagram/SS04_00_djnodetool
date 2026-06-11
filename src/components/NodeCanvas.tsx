// NodeCanvas renders the free-form canvas area: all transition edges in
// an SVG layer behind, and all track nodes on top.
//
// Phase 2: static display only. There is no selection, dragging, or edge
// creation. Edges look up their from/to nodes by id; nodes look up their
// linked track by id (to show the artist).

import type { Track, TrackNode as TrackNodeType, TransitionEdge } from "../domain/types";
import TrackNode from "./TrackNode";
import EdgeView from "./EdgeView";

type NodeCanvasProps = {
  tracks: Track[];
  nodes: TrackNodeType[];
  edges: TransitionEdge[];
};

const ARROW_MARKER_ID = "edge-arrowhead";

function NodeCanvas({ tracks, nodes, edges }: NodeCanvasProps) {
  const findNode = (id: string) => nodes.find((node) => node.id === id);
  const findTrack = (id: string) => tracks.find((track) => track.id === id);

  return (
    <main className="node-canvas">
      <svg className="edge-layer">
        <defs>
          <marker
            id={ARROW_MARKER_ID}
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L8,3 L0,6 Z" className="edge-arrowhead" />
          </marker>
        </defs>
        {edges.map((edge) => {
          const fromNode = findNode(edge.fromNodeId);
          const toNode = findNode(edge.toNodeId);
          if (!fromNode || !toNode) return null;
          return (
            <EdgeView
              key={edge.id}
              fromNode={fromNode}
              toNode={toNode}
              markerId={ARROW_MARKER_ID}
            />
          );
        })}
      </svg>
      {nodes.map((node) => (
        <TrackNode
          key={node.id}
          node={node}
          track={findTrack(node.trackId)}
        />
      ))}
    </main>
  );
}

export default NodeCanvas;
