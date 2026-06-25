// Unit tests for the pure transition-timing helpers.

import { describe, it, expect } from "vitest";
import {
  sanitizeFadeDuration,
  MIN_FADE_SECONDS,
  MAX_FADE_SECONDS,
} from "./transitionTiming";

describe("sanitizeFadeDuration", () => {
  it("keeps a normal positive value", () => {
    expect(sanitizeFadeDuration(3)).toBe(3);
    expect(sanitizeFadeDuration(5)).toBe(5);
  });

  it("rounds zero and negatives to the minimum fade", () => {
    expect(sanitizeFadeDuration(0)).toBe(MIN_FADE_SECONDS);
    expect(sanitizeFadeDuration(-3)).toBe(MIN_FADE_SECONDS);
  });

  it("rounds NaN and Infinity to the minimum fade", () => {
    expect(sanitizeFadeDuration(Number.NaN)).toBe(MIN_FADE_SECONDS);
    expect(sanitizeFadeDuration(Number.POSITIVE_INFINITY)).toBe(
      MIN_FADE_SECONDS,
    );
    expect(sanitizeFadeDuration(Number.NEGATIVE_INFINITY)).toBe(
      MIN_FADE_SECONDS,
    );
  });

  it("caps very large values at the maximum fade", () => {
    expect(sanitizeFadeDuration(1000)).toBe(MAX_FADE_SECONDS);
  });

  it("treats a value at the minimum boundary as the minimum", () => {
    expect(sanitizeFadeDuration(MIN_FADE_SECONDS)).toBe(MIN_FADE_SECONDS);
  });
});
