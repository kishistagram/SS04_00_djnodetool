// InspectorPanel shows read-only details of the currently selected node.
//
// Phase 3: node selection only. It finds the selected node by id and
// displays its label, linked track title/artist, position, and color.
// When nothing is selected it shows a placeholder.
//
// Phase 4.5: a Delete button is shown only when a node is selected. Clicking
// it asks the parent (App) to delete that node via onDeleteNode. The fields
// themselves stay read-only; edge inspection and editing are still out of scope.
//
// Phase 7: a "Start Connection" button begins edge creation from the selected
// node. While connection mode is active it shows a short hint instead.
//
// Phase 7.5: when an edge is selected instead of a node, the panel shows the
// connection's basic info (from -> to, transition type, fade duration) read
// only, plus a "Delete connection" button. Editing the edge is out of scope.

import type { Track, TrackNode, TransitionEdge } from "../domain/types";

type InspectorPanelProps = {
  tracks: Track[];
  nodes: TrackNode[];
  edges: TransitionEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isConnecting: boolean;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onStartConnection: () => void;
};

function InspectorPanel({
  tracks,
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  isConnecting,
  onDeleteNode,
  onDeleteEdge,
  onStartConnection,
}: InspectorPanelProps) {
  // Edge selection takes priority when present (selection is exclusive, so at
  // most one of node/edge is set at a time).
  const edge = edges.find((e) => e.id === selectedEdgeId);
  if (edge) {
    const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
    const toNode = nodes.find((n) => n.id === edge.toNodeId);
    const fromLabel = fromNode ? fromNode.label : edge.fromNodeId;
    const toLabel = toNode ? toNode.label : edge.toNodeId;

    return (
      <section className="inspector-panel">
        <h2>Inspector</h2>
        <dl className="inspector-fields">
          <dt>Connection</dt>
          <dd>
            {fromLabel} → {toLabel}
          </dd>

          <dt>Transition</dt>
          <dd>{edge.transitionType}</dd>

          <dt>Fade</dt>
          <dd>{edge.fadeDurationSec}s</dd>
        </dl>

        <button
          type="button"
          className="delete-edge-button"
          onClick={() => onDeleteEdge(edge.id)}
        >
          Delete connection
        </button>
      </section>
    );
  }

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <section className="inspector-panel">
        <h2>Inspector</h2>
        <p className="inspector-placeholder">Select a node or connection</p>
      </section>
    );
  }

  const track = tracks.find((t) => t.id === node.trackId);

  return (
    <section className="inspector-panel">
      <h2>Inspector</h2>
      <dl className="inspector-fields">
        <dt>Label</dt>
        <dd>{node.label}</dd>

        <dt>Track</dt>
        <dd>{track ? track.title : node.trackId}</dd>

        <dt>Artist</dt>
        <dd>{track?.artist ?? "—"}</dd>

        <dt>Position</dt>
        <dd>
          x: {node.x}, y: {node.y}
        </dd>

        <dt>Color</dt>
        <dd>
          {node.color ? (
            <span className="inspector-color">
              <span
                className="inspector-color-swatch"
                style={{ background: node.color }}
              />
              {node.color}
            </span>
          ) : (
            "—"
          )}
        </dd>
      </dl>

      {isConnecting ? (
        <p className="inspector-hint">
          Connection mode: click a target node, or click empty space to cancel.
        </p>
      ) : (
        <button
          type="button"
          className="start-connection-button"
          onClick={onStartConnection}
        >
          Start Connection
        </button>
      )}

      <button
        type="button"
        className="delete-node-button"
        onClick={() => onDeleteNode(node.id)}
      >
        Delete node
      </button>
    </section>
  );
}

export default InspectorPanel;
