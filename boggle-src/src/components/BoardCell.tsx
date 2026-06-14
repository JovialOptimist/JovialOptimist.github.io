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
          tapMode && !isBlocked ? "board-cell--tappable" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-row={cell.row}
        data-col={cell.col}
        role={isBlocked ? undefined : "button"}
        tabIndex={tapMode && !isBlocked ? 0 : -1}
        onClick={tapMode && !isBlocked ? onTap : undefined}
        onKeyDown={
          tapMode && !isBlocked
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
      >
        <span className="board-cell__face">{label}</span>
      </div>
    </div>
  );
}
