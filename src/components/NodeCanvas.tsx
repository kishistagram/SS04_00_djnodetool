// NodeCanvas renders the free-form canvas area: all transition edges in
// an SVG layer behind, and all track nodes on top.
//
// Phase 3: node selection. Clicking a node selects it (via onSelectNode);
// clicking the empty canvas background deselects (via onDeselect). Edges
// look up their from/to nodes by id; nodes look up their linked track by
// id (to show the artist).
//
// Phase 5: node dragging. NodeCanvas owns the canvas DOM ref and passes it to
// each TrackNode so a node can convert mouse coordinates into canvas-relative
// x/y while dragging. onMoveNode writes the new position back to the project.

import { useRef } from "react";
import type { Track, TrackNode as TrackNodeType, TransitionEdge } from "../domain/types";
import TrackNode from "./TrackNode";
import EdgeView from "./EdgeView";

type NodeCanvasProps = {
  tracks: Track[];
  nodes: TrackNodeType[];
  edges: TransitionEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onDeselect: () => void;
  onMoveNode: (id: string, x: number, y: number) => void;
};

const ARROW_MARKER_ID = "edge-arrowhead";

function NodeCanvas({
  tracks,
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onDeselect,
  onMoveNode,
}: NodeCanvasProps) {
  const findNode = (id: string) => nodes.find((node) => node.id === id);
  const findTrack = (id: string) => tracks.find((track) => track.id === id);

  // The canvas element, used by nodes to map mouse coordinates to canvas
  // space while dragging. Owned here so nodes never query the DOM directly.
  const canvasRef = useRef<HTMLElement>(null);

  return (
    <main className="node-canvas" ref={canvasRef} onClick={onDeselect}>
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
          isSelected={node.id === selectedNodeId}
          canvasRef={canvasRef}
          onSelect={() => onSelectNode(node.id)}
          onMove={(x, y) => onMoveNode(node.id, x, y)}
        />
      ))}
    </main>
  );
}

export default NodeCanvas;
