import type { Board, FoundWord, GamePhase } from "./types";
import { BOARD_SIZE } from "./types";

const STORAGE_KEY = "boggle-game-save";
const SAVE_VERSION = 1;

export type SavedGame = {
  version: typeof SAVE_VERSION;
  phase: Extract<GamePhase, "playing" | "results">;
  board: Board;
  foundWords: FoundWord[];
  foundWordsSet: string[];
  totalScore: number;
  secondsLeft: number;
  savedAt: number;
};

function isValidBoard(board: unknown): board is Board {
  if (!Array.isArray(board) || board.length !== BOARD_SIZE) return false;
  return board.every(
    (row) =>
      Array.isArray(row) &&
      row.length === BOARD_SIZE &&
      row.every(
        (cell) =>
          cell &&
          typeof cell.row === "number" &&
          typeof cell.col === "number" &&
          typeof cell.face === "string" &&
          typeof cell.isBlocked === "boolean",
      ),
  );
}

function isValidSavedGame(data: unknown): data is SavedGame {
  if (!data || typeof data !== "object") return false;
  const s = data as SavedGame;
  return (
    s.version === SAVE_VERSION &&
    (s.phase === "playing" || s.phase === "results") &&
    isValidBoard(s.board) &&
    Array.isArray(s.foundWords) &&
    Array.isArray(s.foundWordsSet) &&
    typeof s.totalScore === "number" &&
    typeof s.secondsLeft === "number" &&
    typeof s.savedAt === "number"
  );
}

export function hasSavedGame(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function loadSavedGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidSavedGame(parsed)) {
      clearSavedGame();
      return null;
    }
    return parsed;
  } catch {
    clearSavedGame();
    return null;
  }
}

export function saveGame(state: Omit<SavedGame, "version">): void {
  try {
    const payload: SavedGame = { version: SAVE_VERSION, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* storage full or unavailable */
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function elapsedSecondsSince(savedAt: number): number {
  return Math.max(0, Math.floor((Date.now() - savedAt) / 1000));
}
