import { faceDisplay, isDoubleLetterFace } from "../data/dice";
import type { Cell } from "../game/types";

type Props = {
  cell: Cell;
  selected: boolean;
  feedback: { type: "valid" | "invalid"; pulseKey: number } | null;
  onTap?: () => void;
  tapMode: boolean;
};

export function BoardCell({ cell, selected, feedback, onTap, tapMode }: Props) {
  const isBlocked = cell.isBlocked;
  const isDouble = isDoubleLetterFace(cell.face);
  const label = isBlocked ? "" : faceDisplay(cell.face);
  const interactive = tapMode && !isBlocked;

  return (
    <div
      className={[
        "board-cell-wrap",
        feedback?.type === "valid" ? "board-cell-wrap--feedback-valid" : "",
        feedback?.type === "invalid" ? "board-cell-wrap--feedback-invalid" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "board-cell",
          isBlocked ? "board-cell--blocked" : "",
          selected ? "board-cell--selected" : "",
          feedback?.type === "valid" ? "board-cell--feedback-valid" : "",
          feedback?.type === "invalid" ? "board-cell--feedback-invalid" : "",
          isDouble ? "board-cell--double" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="board-cell__face">{label}</span>
      </div>

      <div
        className={[
          "board-cell-hit",
          isBlocked ? "board-cell-hit--blocked" : "",
          interactive ? "board-cell-hit--tappable" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-row={cell.row}
        data-col={cell.col}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : -1}
        onClick={interactive ? onTap : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTap?.();
                }
              }
            : undefined
        }
        aria-label={
          isBlocked ? "Blocked cell" : `Letter ${label}${selected ? ", selected" : ""}`
        }
      />
    </div>
  );
}
