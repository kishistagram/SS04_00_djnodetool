// App is the top-level component. It owns the project data (mock data for
// now) and lays out the two main regions: the Track Library on the left
// and the Node Canvas on the right.
//
// Phase 2: static rendering only. The Inspector Panel and Player Controls
// are not part of this phase.

import { mockProject } from "./domain/mockProject";
import TrackLibrary from "./components/TrackLibrary";
import NodeCanvas from "./components/NodeCanvas";

function App() {
  const project = mockProject;

  return (
    <div className="app-layout">
      <TrackLibrary tracks={project.tracks} />
      <NodeCanvas
        tracks={project.tracks}
        nodes={project.nodes}
        edges={project.edges}
      />
    </div>
  );
}

export default App;
