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
//
// Phase 5: "Drag nodes". A node can be dragged on the canvas; each move writes
// the node's new x/y back into the project. Connected edges follow because
// EdgeView derives its line geometry from the nodes' x/y.
//
// Phase 6: "JSON save/load". The project can be exported to a JSON file and
// imported back via the Project Toolbar. On a successful import the whole
// project is replaced and the selection is cleared.
//
// Phase 7: "Edge creation". Selecting a node and clicking "Start Connection"
// puts the canvas in connection mode; clicking a different node then creates a
// directed transition edge from the source to the target. Clicking empty space
// (or the source node) cancels. Audio and crossfade are not part of this phase.

import { useState } from "react";
// The type and the component are both named TrackNode; alias the type to
// TrackNodeData here to avoid a naming collision with the component.
import type {
  Project,
  TransitionEdge,
  TrackNode as TrackNodeData,
} from "./domain/types";
import { mockProject } from "./domain/mockProject";
import { downloadProject, parseProject } from "./storage/projectStorage";
import TrackLibrary from "./components/TrackLibrary";
import ProjectToolbar from "./components/ProjectToolbar";
import NodeCanvas from "./components/NodeCanvas";
import InspectorPanel from "./components/InspectorPanel";

// Default color for runtime-created nodes (tracks have no color of their own).
const DEFAULT_NODE_COLOR = "#64748B";

function App() {
  // The whole project lives in state so nodes can be added at runtime.
  const [project, setProject] = useState<Project>(mockProject);

  // The currently selected node, or null when nothing is selected.
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // The source node id while the canvas is in connection mode, or null in
  // normal mode. Connection mode is entered via "Start Connection".
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(
    null,
  );

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

  // Move a node to a new position by writing its x/y back into the project.
  // Called repeatedly while dragging, so it only replaces the one node.
  function handleMoveNode(nodeId: string, x: number, y: number) {
    setProject((current) => ({
      ...current,
      nodes: current.nodes.map((node) =>
        node.id === nodeId ? { ...node, x, y } : node,
      ),
    }));
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

  // Export the current project as a downloadable JSON file.
  function handleExport() {
    downloadProject(project);
  }

  // Import a project from a JSON file, replacing the current one. On any parse
  // or validation error, keep the current project and show a simple message.
  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const loaded = parseProject(String(reader.result));
        setProject(loaded);
        setSelectedNodeId(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load file.";
        window.alert(`Import failed: ${message}`);
      }
    };
    reader.onerror = () => {
      window.alert("Import failed: could not read the file.");
    };
    reader.readAsText(file);
  }

  // Enter connection mode using the currently selected node as the source.
  function handleStartConnection() {
    if (selectedNodeId) {
      setConnectionSourceId(selectedNodeId);
    }
  }

  // Handle a click on a node. In connection mode, clicking a different node
  // creates the edge and returns to normal mode (the source stays selected);
  // clicking the source node cancels. In normal mode, it selects the node.
  function handleNodeClick(nodeId: string) {
    if (connectionSourceId) {
      if (nodeId !== connectionSourceId) {
        const newEdge: TransitionEdge = {
          id: crypto.randomUUID(),
          fromNodeId: connectionSourceId,
          toNodeId: nodeId,
          transitionType: "crossfade",
          fadeDurationSec: 3,
        };
        setProject((current) => ({
          ...current,
          edges: [...current.edges, newEdge],
        }));
      }
      // Leave connection mode; keep the source node selected.
      setConnectionSourceId(null);
      return;
    }
    setSelectedNodeId(nodeId);
  }

  // Handle a click on the empty canvas background. In connection mode it
  // cancels the connection; otherwise it clears the selection.
  function handleBackgroundClick() {
    if (connectionSourceId) {
      setConnectionSourceId(null);
      return;
    }
    setSelectedNodeId(null);
  }

  return (
    <div className="app-layout">
      <div className="left-column">
        <ProjectToolbar
          onExport={handleExport}
          onImportFile={handleImportFile}
        />
        <TrackLibrary
          tracks={project.tracks}
          onAddToCanvas={handleAddToCanvas}
        />
        <InspectorPanel
          tracks={project.tracks}
          nodes={project.nodes}
          selectedNodeId={selectedNodeId}
          isConnecting={connectionSourceId !== null}
          onDeleteNode={handleDeleteNode}
          onStartConnection={handleStartConnection}
        />
      </div>
      <NodeCanvas
        tracks={project.tracks}
        nodes={project.nodes}
        edges={project.edges}
        selectedNodeId={selectedNodeId}
        connectionSourceId={connectionSourceId}
        onSelectNode={setSelectedNodeId}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        onMoveNode={handleMoveNode}
      />
    </div>
  );
}

export default App;
