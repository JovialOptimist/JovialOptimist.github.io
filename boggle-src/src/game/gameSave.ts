import type { BoardSize } from "./settings";
import type { Board, FoundWord, GamePhase } from "./types";

const STORAGE_KEY = "boggle-game-save";
const SAVE_VERSION = 2;

export type SavedGame = {
  version: typeof SAVE_VERSION;
  phase: Extract<GamePhase, "playing" | "results">;
  boardSize: BoardSize;
  timeLimitSeconds: number | null;
  board: Board;
  foundWords: FoundWord[];
  foundWordsSet: string[];
  totalScore: number;
  secondsLeft: number;
  savedAt: number;
  isPaused: boolean;
};

type SavedGameV1 = {
  version: 1;
  phase: Extract<GamePhase, "playing" | "results">;
  board: Board;
  foundWords: FoundWord[];
  foundWordsSet: string[];
  totalScore: number;
  secondsLeft: number;
  savedAt: number;
};

function isBoardSize(value: unknown): value is BoardSize {
  return value === 4 || value === 5 || value === 6;
}

function isValidBoard(board: unknown, boardSize: number): board is Board {
  if (!Array.isArray(board) || board.length !== boardSize) return false;
  return board.every(
    (row) =>
      Array.isArray(row) &&
      row.length === boardSize &&
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

function normalizeSavedGame(data: unknown): SavedGame | null {
  if (!data || typeof data !== "object") return null;

  if ((data as SavedGameV1).version === 1) {
    const s = data as SavedGameV1;
    const boardSize = s.board.length;
    if (!isBoardSize(boardSize) || !isValidBoard(s.board, boardSize)) {
      return null;
    }
    return {
      version: SAVE_VERSION,
      phase: s.phase,
      boardSize,
      timeLimitSeconds: 180,
      board: s.board,
      foundWords: s.foundWords,
      foundWordsSet: s.foundWordsSet,
      totalScore: s.totalScore,
      secondsLeft: s.secondsLeft,
      savedAt: s.savedAt,
      isPaused: false,
    };
  }

  const s = data as SavedGame;
  if (
    s.version !== SAVE_VERSION ||
    (s.phase !== "playing" && s.phase !== "results") ||
    !isBoardSize(s.boardSize) ||
    !isValidBoard(s.board, s.boardSize) ||
    (s.timeLimitSeconds !== null &&
      (typeof s.timeLimitSeconds !== "number" || s.timeLimitSeconds <= 0)) ||
    !Array.isArray(s.foundWords) ||
    !Array.isArray(s.foundWordsSet) ||
    typeof s.totalScore !== "number" ||
    typeof s.secondsLeft !== "number" ||
    typeof s.savedAt !== "number"
  ) {
    return null;
  }

  return {
    ...s,
    isPaused: typeof s.isPaused === "boolean" ? s.isPaused : false,
  };
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
    const saved = normalizeSavedGame(parsed);
    if (!saved) {
      clearSavedGame();
      return null;
    }
    return saved;
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
