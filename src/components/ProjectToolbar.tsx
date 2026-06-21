// ProjectToolbar holds the project-level actions: Export JSON and Import JSON.
//
// Phase 6: it stays presentational. It does not own project state; it calls
// back to App via onExport / onImportFile. Keeping these controls here avoids
// mixing save/load UI into the Track Library.

import { useRef } from "react";

type ProjectToolbarProps = {
  onExport: () => void;
  onImportFile: (file: File) => void;
};

function ProjectToolbar({ onExport, onImportFile }: ProjectToolbarProps) {
  // A hidden file input drives the import; the visible button just opens it.
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onImportFile(file);
    }
    // Reset so selecting the same file again still fires a change event.
    event.target.value = "";
  }

  return (
    <div className="project-toolbar">
      <button type="button" className="toolbar-button" onClick={onExport}>
        Export JSON
      </button>
      <button
        type="button"
        className="toolbar-button"
        onClick={handleImportClick}
      >
        Import JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="toolbar-file-input"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default ProjectToolbar;
