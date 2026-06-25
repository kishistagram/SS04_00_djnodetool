// Pure helpers for transition timing.
//
// Kept free of the Web Audio API so they can be unit tested. The AudioEngine
// uses sanitizeFadeDuration to turn a TransitionEdge.fadeDurationSec (which may
// be 0, negative, NaN, or Infinity in imported/edited data) into a safe value.
//
// Policy (Phase 9): abnormal values round down to a tiny fade (0.01s) so the
// transition is essentially instant. We prefer an almost-immediate transition
// over silently substituting a "natural" 3s, which would hide bad data.

// The smallest fade we allow. Also used for `cut`, which is effectively an
// instant transition with just enough ramp to avoid a click.
export const MIN_FADE_SECONDS = 0.01;

// An upper clamp so a huge or Infinity value cannot schedule an absurd ramp.
export const MAX_FADE_SECONDS = 60;

// Clamp fadeDurationSec to a safe, finite range. Anything that is not a finite
// number greater than MIN_FADE_SECONDS becomes MIN_FADE_SECONDS; values above
// MAX_FADE_SECONDS are capped.
export function sanitizeFadeDuration(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= MIN_FADE_SECONDS) {
    return MIN_FADE_SECONDS;
  }
  if (seconds > MAX_FADE_SECONDS) {
    return MAX_FADE_SECONDS;
  }
  return seconds;
}
