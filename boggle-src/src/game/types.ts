export type Coord = { row: number; col: number };

export type Cell = {
  row: number;
  col: number;
  face: string;
  isBlocked: boolean;
};

export type Board = Cell[][];

export type InputMode = "drag" | "tap";

export type FoundWord = {
  word: string;
  points: number;
};

export type GamePhase = "home" | "loading" | "playing" | "results";

export const BOARD_SIZE = 6;
export const ROUND_SECONDS = 180;
export const MIN_WORD_LENGTH = 4;

export type SubmitResult = "valid" | "invalid" | "tooShort" | "duplicate" | "ended";

export type CellFeedback = {
  path: Coord[];
  type: "valid" | "invalid";
  key: number;
} | null;

export const CELL_FEEDBACK_MS = 1000;
