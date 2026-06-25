// Unit tests for the pure node -> sound mapping. The Web Audio API is not
// involved here, so these run fine under jsdom/node.

import { describe, it, expect } from "vitest";
import type { TrackNode } from "../domain/types";
import { hashString, soundForNode } from "./nodeSound";

function makeNode(id: string): TrackNode {
  return { id, trackId: "track-x", x: 0, y: 0, label: id };
}

const VALID_WAVEFORMS = ["sine", "triangle", "square", "sawtooth"];

describe("hashString", () => {
  it("is deterministic for the same input", () => {
    expect(hashString("node-001")).toBe(hashString("node-001"));
  });

  it("is always non-negative", () => {
    for (const id of ["a", "node-001", "あ", "", "xyz-123-very-long-id"]) {
      expect(hashString(id)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("soundForNode", () => {
  it("returns the same sound for the same node id", () => {
    expect(soundForNode(makeNode("node-001"))).toEqual(
      soundForNode(makeNode("node-001")),
    );
  });

  it("returns a positive frequency and a valid waveform", () => {
    const sound = soundForNode(makeNode("node-001"));
    expect(sound.frequency).toBeGreaterThan(0);
    expect(VALID_WAVEFORMS).toContain(sound.waveform);
  });

  it("gives different nodes different sounds (at least sometimes)", () => {
    const ids = ["node-001", "node-002", "node-003", "node-004", "node-005"];
    const signatures = new Set(
      ids.map((id) => {
        const s = soundForNode(makeNode(id));
        return `${s.frequency}-${s.waveform}`;
      }),
    );
    // Not all five collapse to one sound; the mapping actually varies.
    expect(signatures.size).toBeGreaterThan(1);
  });
});
