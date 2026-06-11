// App is the top-level component. It owns the project data and the current
// selection state, and lays out the regions: the Track Library and Inspector
// Panel on the left, and the Node Canvas on the right.
//
// Phase 4: "Add to Canvas". The project is now held in useState (seeded with
// mockProject) so it can change at runtime. Clicking "Add to Canvas" on a
// track creates a new node, appends it to the project, and selects it.
//
// Phase 4.5: "Delete selected node". The Inspector's Delete button removes the
// selected node (and any edges connected to it) and clears the selection.
// Dragging, edge creation, and import/export are not part of these phases.

import { useState } from "react";
// The type and the component are both named TrackNode; alias the type to
// TrackNodeData here to avoid a naming collision with the component.
import type { Project, TrackNode as TrackNodeData } from "./domain/types";
import { mockProject } from "./domain/mockProject";
import TrackLibrary from "./components/TrackLibrary";
import NodeCanvas from "./components/NodeCanvas";
import InspectorPanel from "./components/InspectorPanel";

// Default color for runtime-created nodes (tracks have no color of their own).
const DEFAULT_NODE_COLOR = "#64748B";

function App() {
  // The whole project lives in state so nodes can be added at runtime.
  const [project, setProject] = useState<Project>(mockProject);

  // The currently selected node, or null when nothing is selected.
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Create a new node from a track and add it to the canvas, then select it.
  function handleAddToCanvas(trackId: string) {
    const track = project.tracks.find((t) => t.id === trackId);
    if (!track) return;

    // Simple fixed offset so repeated additions do not fully overlap.
    // A proper auto-layout is intentionally out of scope for this phase.
    const offset = project.nodes.length * 30;
    const newNode: TrackNodeData = {
      id: crypto.randomUUID(),
      trackId: track.id,
      x: 200 + offset,
      y: 200 + offset,
      label: track.title,
      color: DEFAULT_NODE_COLOR,
    };

    setProject((current) => ({
      ...current,
      nodes: [...current.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
  }

  // Delete a node and any edges connected to it, then clear the selection.
  function handleDeleteNode(nodeId: string) {
    setProject((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => node.id !== nodeId),
      // Remove edges touching the deleted node so no edge dangles.
      edges: current.edges.filter(
        (edge) => edge.fromNodeId !== nodeId && edge.toNodeId !== nodeId,
      ),
    }));
    setSelectedNodeId(null);
  }

  return (
    <div className="app-layout">
      <div className="left-column">
        <TrackLibrary
          tracks={project.tracks}
          onAddToCanvas={handleAddToCanvas}
        />
        <InspectorPanel
          tracks={project.tracks}
          nodes={project.nodes}
          selectedNodeId={selectedNodeId}
          onDeleteNode={handleDeleteNode}
        />
      </div>
      <NodeCanvas
        tracks={project.tracks}
        nodes={project.nodes}
        edges={project.edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        onDeselect={() => setSelectedNodeId(null)}
      />
    </div>
  );
}

export default App;
