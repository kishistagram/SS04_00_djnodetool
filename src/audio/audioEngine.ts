// AudioEngine: the only place that talks to the Web Audio API.
//
// The UI calls a small high-level API (playNode / stop / dispose) and never
// sees oscillators, frequencies, or waveforms. This keeps audio logic out of
// React components (see docs/06_audio_engine_requirements.md).
//
// Phase 8: simple playback using an OscillatorNode as a placeholder sound
// source. The wiring is `source -> gain -> destination`, the same shape the
// requirements describe for buffer playback, so swapping in real audio later
// only changes how the source is created (see createSourceForNode).
//
// Not in this phase: fade, crossfade, loading node.audioUrl, AudioBuffer
// decoding. Those come with Phase 13 and the later Suno-audio phase.

import type { TrackNode } from "../domain/types";
import { soundForNode } from "./nodeSound";

// A playing voice: the source plus its gain, kept together so stop() can ramp
// the gain down and disconnect both.
type Voice = {
  source: AudioScheduledSourceNode;
  gain: GainNode;
};

// Short ramp times (seconds) so notes don't click on start/stop.
const ATTACK_SECONDS = 0.02;
const RELEASE_SECONDS = 0.05;
// Steady-state volume while a note plays (kept below 1 to avoid harshness).
const PLAY_GAIN = 0.2;

export class AudioEngine {
  // Created lazily on the first playNode() call, which must be a user gesture
  // so the browser allows audio. Null until then.
  private context: AudioContext | null = null;

  // The currently playing voice, or null when nothing is playing. The MVP
  // plays one node at a time; starting a new one stops the previous.
  private currentVoice: Voice | null = null;

  // Lazily create (or resume) the AudioContext. Called from playNode so the
  // context is only created in response to a user action.
  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    // If a previous interaction left it suspended, resume it.
    if (this.context.state === "suspended") {
      void this.context.resume();
    }
    return this.context;
  }

  // Create the audio source for a node. This is the single swap point: today it
  // returns an oscillator; later it can return an AudioBufferSourceNode built
  // from node.audioUrl, without changing the rest of the engine or the UI.
  private createSourceForNode(
    context: AudioContext,
    node: TrackNode,
  ): AudioScheduledSourceNode {
    const { frequency, waveform } = soundForNode(node);
    const oscillator = context.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    return oscillator;
  }

  // Play a node's sound. Stops any current sound first, so only one plays at a
  // time. Safe to call repeatedly (e.g. clicking Play on different nodes).
  playNode(node: TrackNode): void {
    const context = this.ensureContext();
    this.stop();

    const source = this.createSourceForNode(context, node);
    const gain = context.createGain();
    // Wiring: source -> gain -> destination.
    source.connect(gain);
    gain.connect(context.destination);

    // Small attack ramp from 0 to PLAY_GAIN to avoid a click.
    const now = context.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(PLAY_GAIN, now + ATTACK_SECONDS);

    source.start();
    this.currentVoice = { source, gain };

    // If the source ends on its own, drop the reference so we don't reuse it.
    source.onended = () => {
      if (this.currentVoice?.source === source) {
        this.currentVoice = null;
      }
    };
  }

  // Stop the current sound with a short release ramp, then disconnect its nodes
  // so old sources don't pile up.
  stop(): void {
    const voice = this.currentVoice;
    if (!voice || !this.context) return;
    this.currentVoice = null;

    const { source, gain } = voice;
    const now = this.context.currentTime;
    // Release ramp to 0, then stop just after it finishes.
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + RELEASE_SECONDS);

    // Clear the handler so stopping here doesn't also null a newer voice.
    source.onended = null;
    try {
      source.stop(now + RELEASE_SECONDS);
    } catch {
      // Starting/stopping an already-stopped source can throw; ignore it.
    }
    // Disconnect after the release so the ramp can finish audibly.
    window.setTimeout(
      () => {
        source.disconnect();
        gain.disconnect();
      },
      Math.ceil(RELEASE_SECONDS * 1000) + 20,
    );
  }

  // Release all audio resources. Called when the app unmounts.
  dispose(): void {
    this.stop();
    if (this.context) {
      void this.context.close();
      this.context = null;
    }
  }
}
