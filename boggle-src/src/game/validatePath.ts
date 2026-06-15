import { effectiveWordLength, faceDisplay, isDoubleLetterFace } from "../data/dice";
import type { Board, Coord } from "./types";
import { MIN_WORD_LENGTH } from "./types";
import { getCell, neighbors } from "./generateBoard";

function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

function facesFromPath(board: Board, path: Coord[]): string[] {
  return path.map(({ row, col }) => getCell(board, row, col)!.face);
}

/** Validate that a user-selected path spells a dictionary word. */
export function validatePath(
  board: Board,
  path: Coord[],
  dictionary: Set<string>,
): { valid: boolean; word: string; reason?: string } {
  if (path.length === 0) {
    return { valid: false, word: "", reason: "empty" };
  }

  const faces = facesFromPath(board, path);
  if (faces.some((face) => face === "###")) {
    return { valid: false, word: "", reason: "blocked" };
  }

  const effectiveLen = effectiveWordLength(faces);
  if (effectiveLen < MIN_WORD_LENGTH) {
    return { valid: false, word: "", reason: "tooShort" };
  }

  const word = normalizeWord(faces.map(faceDisplay).join(""));
  if (!dictionary.has(word)) {
    return { valid: false, word, reason: "notInDictionary" };
  }

  return { valid: true, word };
}

export function canAddCell(board: Board, path: Coord[], next: Coord): boolean {
  const cell = getCell(board, next.row, next.col);
  if (!cell || cell.isBlocked) return false;

  if (path.some((p) => p.row === next.row && p.col === next.col)) {
    return false;
  }

  if (path.length === 0) return true;

  const last = path[path.length - 1]!;
  return neighbors(last.row, last.col, board.length).some(
    (n) => n.row === next.row && n.col === next.col,
  );
}

export function pathPreviewWord(board: Board, path: Coord[]): string {
  return facesFromPath(board, path)
    .map(faceDisplay)
    .join("");
}

export function pathEffectiveLength(board: Board, path: Coord[]): number {
  return effectiveWordLength(facesFromPath(board, path));
}

export function isDoubleLetterCell(board: Board, coord: Coord): boolean {
  const cell = getCell(board, coord.row, coord.col);
  return cell ? isDoubleLetterFace(cell.face) : false;
}
