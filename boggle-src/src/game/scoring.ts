import { MIN_WORD_LENGTH } from "./types";

/** Super Big Boggle scoring table. */
export function scoreWord(effectiveLength: number): number {
  if (effectiveLength < MIN_WORD_LENGTH) return 0;
  if (effectiveLength === 4) return 1;
  if (effectiveLength === 5) return 2;
  if (effectiveLength === 6) return 3;
  if (effectiveLength === 7) return 5;
  if (effectiveLength === 8) return 11;
  return effectiveLength * 2;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
