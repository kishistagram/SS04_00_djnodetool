// Unit tests for the pure storage functions: serializeProject and
// parseProject. The DOM-based downloadProject is not tested here.

import { describe, it, expect } from "vitest";
import type { Project } from "../domain/types";
import { serializeProject, parseProject } from "./projectStorage";

const sampleProject: Project = {
  id: "project-test",
  title: "Test Mix",
  tracks: [
    {
      id: "track-001",
      title: "Night Drive",
      artist: "Sample Artist",
      bpm: 110,
      tags: ["night"],
    },
  ],
  nodes: [
    { id: "node-001", trackId: "track-001", x: 100, y: 160, label: "Night Drive" },
  ],
  edges: [
    {
      id: "edge-001",
      fromNodeId: "node-001",
      toNodeId: "node-002",
      transitionType: "crossfade",
      fadeDurationSec: 5,
    },
  ],
};

describe("serializeProject", () => {
  it("produces JSON with two-space indentation", () => {
    const json = serializeProject(sampleProject);
    expect(json).toContain('\n  "id": "project-test"');
  });
});

describe("parseProject", () => {
  it("round-trips a serialized project", () => {
    const json = serializeProject(sampleProject);
    expect(parseProject(json)).toEqual(sampleProject);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseProject("{ not json")).toThrow();
  });

  it("throws when a required field is missing", () => {
    const { id: _omitted, ...withoutId } = sampleProject;
    void _omitted;
    expect(() => parseProject(JSON.stringify(withoutId))).toThrow();
  });

  it("throws when a required field has the wrong type", () => {
    const badTracks = { ...sampleProject, tracks: "not-an-array" };
    expect(() => parseProject(JSON.stringify(badTracks))).toThrow();
  });
});
