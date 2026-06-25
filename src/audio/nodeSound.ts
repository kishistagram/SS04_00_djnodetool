// Pure mapping from a node to the sound it should make.
//
// This is the only "musical" decision in the oscillator-based MVP engine, and
// it is kept pure (no Web Audio API) so it can be unit tested. The AudioEngine
// calls this to decide which frequency and waveform to use for a node.
//
// Phase 8: oscillator placeholder. When real audio is added later, the engine
// will play node.audioUrl instead and this mapping becomes unnecessary; until
// then it gives each node a stable, distinct tone.

import type { TrackNode } from "../domain/types";

export type NodeSound = {
  frequency: number;
  waveform: OscillatorType;
};

// A small set of pitches (a pentatonic-ish scale) so different nodes sound
// distinct but still pleasant together. Values are in Hz.
const FREQUENCIES = [
  220.0, // A3
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.0, // G4
  440.0, // A4
  523.25, // C5
  587.33, // D5
];

// The waveforms we choose from. "sine" is soft; the others add variety.
const WAVEFORMS: OscillatorType[] = ["sine", "triangle", "square", "sawtooth"];

// Turn a string id into a stable non-negative integer hash. The same id always
// produces the same number, so a node always sounds the same.
export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    // (hash * 31 + charCode), kept in 32-bit range to stay deterministic.
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  // Force non-negative.
  return hash < 0 ? -hash : hash;
}

// Map a node to a stable frequency and waveform based on its id.
export function soundForNode(node: TrackNode): NodeSound {
  const hash = hashString(node.id);
  return {
    frequency: FREQUENCIES[hash % FREQUENCIES.length],
    waveform: WAVEFORMS[hash % WAVEFORMS.length],
  };
}
