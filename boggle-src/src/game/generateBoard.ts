import { getDiceSet, isBlankFace } from "../data/dice";
import type { BoardSize } from "./settings";
import type { Board, Cell } from "./types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function pickFace(faces: string[]): string {
  return faces[Math.floor(Math.random() * faces.length)]!;
}

export function generateBoard(boardSize: BoardSize): Board {
  const diceSet = getDiceSet(boardSize);
  const rolled = diceSet.map((faces) => pickFace(faces));
  const shuffled = shuffle(rolled);

  const board: Board = [];
  let index = 0;

  for (let row = 0; row < boardSize; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col < boardSize; col++) {
      const face = shuffled[index]!;
      index++;
      rowCells.push({
        row,
        col,
        face,
        isBlocked: isBlankFace(face),
      });
    }
    board.push(rowCells);
  }

  return board;
}

export function getCell(board: Board, row: number, col: number): Cell | null {
  const boardSize = board.length;
  if (row < 0 || col < 0 || row >= boardSize || col >= boardSize) {
    return null;
  }
  return board[row]![col]!;
}

export function neighbors(
  row: number,
  col: number,
  boardSize: number,
): { row: number; col: number }[] {
  const result: { row: number; col: number }[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nc >= 0 && nr < boardSize && nc < boardSize) {
        result.push({ row: nr, col: nc });
      }
    }
  }
  return result;
}

export function coordKey(row: number, col: number): string {
  return `${row},${col}`;
}
