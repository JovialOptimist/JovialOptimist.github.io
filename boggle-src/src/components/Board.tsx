import type { CSSProperties } from "react";
import type { RefObject } from "react";
import type { Board as BoardType, CellFeedback, Coord } from "../game/types";
import { BoardCell } from "./BoardCell";

type Props = {
  board: BoardType;
  boardRef: RefObject<HTMLDivElement>;
  isSelected: (row: number, col: number) => boolean;
  cellFeedback: CellFeedback;
  path: Coord[];
  tapMode: boolean;
  onCellTap: (coord: Coord) => void;
  disabled?: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
  };
};

function cellFeedbackForCell(
  feedback: CellFeedback,
  row: number,
  col: number,
): { type: "valid" | "invalid"; pulseKey: number } | null {
  if (!feedback) return null;
  const inPath = feedback.path.some((p) => p.row === row && p.col === col);
  return inPath ? { type: feedback.type, pulseKey: feedback.key } : null;
}

export function Board({
  board,
  boardRef,
  isSelected,
  cellFeedback,
  path,
  tapMode,
  onCellTap,
  disabled,
  handlers,
}: Props) {
  const boardSize = board.length;

  return (
    <div
      ref={boardRef}
      className={`board ${tapMode ? "board--tap" : "board--drag"}`}
      style={{ "--board-size": boardSize } as CSSProperties}
      {...(tapMode ? {} : handlers)}
      aria-label="Boggle board"
    >
      <div className="board-grid">
        <svg className="path-overlay" aria-hidden="true">
          {path.length > 1 &&
            path.map((coord, i) => {
              if (i === 0) return null;
              const prev = path[i - 1]!;
              return (
                <line
                  key={`${prev.row}-${prev.col}-${coord.row}-${coord.col}`}
                  x1={`${((prev.col + 0.5) / boardSize) * 100}%`}
                  y1={`${((prev.row + 0.5) / boardSize) * 100}%`}
                  x2={`${((coord.col + 0.5) / boardSize) * 100}%`}
                  y2={`${((coord.row + 0.5) / boardSize) * 100}%`}
                />
              );
            })}
        </svg>
        {board.map((row) =>
          row.map((cell) => {
            const feedback = cellFeedbackForCell(cellFeedback, cell.row, cell.col);
            return (
              <BoardCell
                key={
                  feedback
                    ? `${cell.row}-${cell.col}-${feedback.pulseKey}`
                    : `${cell.row}-${cell.col}`
                }
                cell={cell}
                selected={isSelected(cell.row, cell.col)}
                feedback={feedback}
                tapMode={tapMode && !disabled}
                onTap={() => onCellTap({ row: cell.row, col: cell.col })}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
