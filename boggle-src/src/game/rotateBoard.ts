import type { Board, Cell } from "./types";
import { BOARD_SIZE } from "./types";

/** Rotate board 90° clockwise; updates each cell's row/col. */
export function rotateBoardClockwise(board: Board): Board {
  const n = BOARD_SIZE;
  const newBoard: Board = [];

  for (let row = 0; row < n; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col < n; col++) {
      const source = board[n - 1 - col]![row]!;
      rowCells.push({
        ...source,
        row,
        col,
      });
    }
    newBoard.push(rowCells);
  }

  return newBoard;
}
