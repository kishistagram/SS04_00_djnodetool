// App is the top-level component. It owns the project data (mock data for
// now) and the current selection state, and lays out the regions: the
// Track Library and Inspector Panel on the left, and the Node Canvas on
// the right.
//
// Phase 3: node selection. selectedNodeId is held here with useState and
// passed down so the canvas can update it and the inspector can read it.
// Edge selection, dragging, and Player Controls are not part of this phase.

import { useState } from "react";
import { mockProject } from "./domain/mockProject";
import TrackLibrary from "./components/TrackLibrary";
import NodeCanvas from "./components/NodeCanvas";
import InspectorPanel from "./components/InspectorPanel";

function App() {
  const project = mockProject;

  // The currently selected node, or null when nothing is selected.
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  return (
    <div className="app-layout">
      <div className="left-column">
        <TrackLibrary tracks={project.tracks} />
        <InspectorPanel
          tracks={project.tracks}
          nodes={project.nodes}
          selectedNodeId={selectedNodeId}
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
