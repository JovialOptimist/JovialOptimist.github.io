import { MIN_WORD_LENGTH } from "./types";

/** Super Big Boggle scoring table (×10 display points). */
export function scoreWord(effectiveLength: number): number {
  if (effectiveLength < MIN_WORD_LENGTH) return 0;
  let base: number;
  if (effectiveLength === 4) base = 1;
  else if (effectiveLength === 5) base = 2;
  else if (effectiveLength === 6) base = 3;
  else if (effectiveLength === 7) base = 5;
  else if (effectiveLength === 8) base = 11;
  else base = effectiveLength * 2;
  return base * 10;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
