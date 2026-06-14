import { useState } from "react";
import type { RefObject } from "react";
import type {
  Board as BoardType,
  CellFeedback,
  Coord,
  FoundWord,
  InputMode,
} from "../game/types";
import { Board as BoardGrid } from "./Board";
import { CurrentWordBar } from "./CurrentWordBar";
import { InputModeToggle } from "./InputModeToggle";
import { PastWordsStrip } from "./PastWordsStrip";

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
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  onRotateBoard: () => void;
  onClearSelection: () => void;
  foundWords: FoundWord[];
  currentWord: string;
  lastWord: string;
  isSelecting: boolean;
};

export function BoardPanel({
  board,
  boardRef,
  isSelected,
  cellFeedback,
  path,
  tapMode,
  onCellTap,
  disabled,
  handlers,
  inputMode,
  onInputModeChange,
  onRotateBoard,
  onClearSelection,
  foundWords,
  currentWord,
  lastWord,
  isSelecting,
}: Props) {
  const [spinDeg, setSpinDeg] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRotate = () => {
    if (disabled || isSpinning) return;
    onClearSelection();
    setIsSpinning(true);
    setSpinDeg(90);
  };

  const handleSpinTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== "transform" || !isSpinning) return;
    onRotateBoard();
    setIsSpinning(false);
    setSpinDeg(0);
  };

  return (
    <div className="board-panel">
      <div className="board-panel__toolbar">
        <PastWordsStrip words={foundWords} />
        <div className="board-panel__controls">
          <InputModeToggle
            mode={inputMode}
            onChange={onInputModeChange}
            disabled={disabled}
          />
          <button
            type="button"
            className={`btn-rotate ${isSpinning ? "btn-rotate--spinning" : ""}`}
            onClick={handleRotate}
            disabled={disabled || isSpinning}
            aria-label="Rotate board 90 degrees"
            title="Rotate board"
          >
            ↻
          </button>
        </div>
      </div>

      <div
        className="board-spin-wrap"
        style={{
          transform: `rotate(${spinDeg}deg)`,
          transition: isSpinning ? "transform 0.45s ease-in-out" : "none",
        }}
        onTransitionEnd={handleSpinTransitionEnd}
      >
        <BoardGrid
          board={board}
          boardRef={boardRef}
          isSelected={isSelected}
          cellFeedback={cellFeedback}
          path={path}
          tapMode={tapMode}
          onCellTap={onCellTap}
          disabled={disabled}
          handlers={handlers}
        />
      </div>

      <CurrentWordBar
        currentWord={currentWord}
        lastWord={lastWord}
        isSelecting={isSelecting}
      />
    </div>
  );
}
