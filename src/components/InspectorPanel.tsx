// InspectorPanel shows read-only details of the currently selected node.
//
// Phase 3: node selection only. It finds the selected node by id and
// displays its label, linked track title/artist, position, and color.
// When nothing is selected it shows a placeholder.
//
// Phase 4.5: a Delete button is shown only when a node is selected. Clicking
// it asks the parent (App) to delete that node via onDeleteNode. The fields
// themselves stay read-only; edge inspection and editing are still out of scope.

import type { Track, TrackNode } from "../domain/types";

type InspectorPanelProps = {
  tracks: Track[];
  nodes: TrackNode[];
  selectedNodeId: string | null;
  onDeleteNode: (nodeId: string) => void;
};

function InspectorPanel({
  tracks,
  nodes,
  selectedNodeId,
  onDeleteNode,
}: InspectorPanelProps) {
  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <section className="inspector-panel">
        <h2>Inspector</h2>
        <p className="inspector-placeholder">Select a node</p>
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
