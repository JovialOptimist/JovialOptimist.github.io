import { useCallback, useEffect, useRef, useState } from "react";
import type { Board as BoardType, CellFeedback, Coord, FoundWord } from "../game/types";
import { CELL_FEEDBACK_MS } from "../game/types";
import type { SubmitOutcome } from "../hooks/useGame";
import { useBoardSelection } from "../hooks/useBoardSelection";
import { BoardPanel } from "./BoardPanel";
import { ConfirmModal } from "./ConfirmModal";
import { GameTimer } from "./GameTimer";
import { ScoreFloat } from "./ScoreFloat";
import type { JoinWord } from "./WordRail";

type ConfirmAction = "leave" | "newGame";

type Props = {
  board: BoardType;
  displayScore: number;
  foundWords: FoundWord[];
  secondsLeft: number;
  isPlaying: boolean;
  scoreBump: { id: number; points: number; x: number; y: number } | null;
  onSubmitPath: (
    path: Coord[],
    origin?: { x: number; y: number },
  ) => SubmitOutcome;
  onRotateBoard: () => void;
  onClearScoreBump: () => void;
  onLeave: () => void;
  onNewGame: () => void;
};

function LeaveIcon() {
  return (
    <svg
      className="btn-icon__svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function NewGameIcon() {
  return (
    <svg
      className="btn-icon__svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function GameScreen({
  board,
  displayScore,
  foundWords,
  secondsLeft,
  isPlaying,
  scoreBump,
  onSubmitPath,
  onRotateBoard,
  onClearScoreBump,
  onLeave,
  onNewGame,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellFeedback, setCellFeedback] = useState<CellFeedback>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackKeyRef = useRef(0);
  const joinKeyRef = useRef(0);
  const [joinWord, setJoinWord] = useState<JoinWord | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const clearCellFeedback = useCallback(() => {
    clearFeedbackTimer();
    setCellFeedback(null);
  }, [clearFeedbackTimer]);

  const showCellFeedback = useCallback(
    (path: Coord[], type: "valid" | "invalid") => {
      clearFeedbackTimer();
      feedbackKeyRef.current += 1;
      setCellFeedback({
        path: [...path],
        type,
        key: feedbackKeyRef.current,
      });
      feedbackTimerRef.current = window.setTimeout(() => {
        setCellFeedback(null);
        feedbackTimerRef.current = null;
      }, CELL_FEEDBACK_MS);
    },
    [clearFeedbackTimer],
  );

  useEffect(() => () => clearFeedbackTimer(), [clearFeedbackTimer]);

  const handleJoinComplete = useCallback(() => setJoinWord(null), []);

  const handleValidate = useCallback(
    (path: Coord[]): boolean => {
      let origin: { x: number; y: number } | undefined;

      if (path.length > 0) {
        const last = path[path.length - 1]!;
        const cell = boardRef.current?.querySelector(
          `[data-row="${last.row}"][data-col="${last.col}"]`,
        );
        if (cell) {
          const rect = cell.getBoundingClientRect();
          origin = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      }

      const outcome = onSubmitPath(path, origin);

      if (path.length > 0) {
        if (outcome.result === "valid") {
          showCellFeedback(path, "valid");
          joinKeyRef.current += 1;
          setJoinWord({
            word: outcome.word.toUpperCase(),
            key: joinKeyRef.current,
          });
        } else if (outcome.result === "invalid" || outcome.result === "tooShort") {
          showCellFeedback(path, "invalid");
        }
      }

      return (
        outcome.result === "valid" ||
        outcome.result === "duplicate" ||
        outcome.result === "ended"
      );
    },
    [onSubmitPath, showCellFeedback],
  );

  const selection = useBoardSelection({
    board,
    boardRef,
    disabled: !isPlaying,
    onValidatePath: handleValidate,
    onSelectionStart: clearCellFeedback,
  });

  const isSelecting = selection.path.length > 0;

  const handleConfirm = () => {
    if (confirmAction === "leave") {
      onLeave();
    } else if (confirmAction === "newGame") {
      onNewGame();
    }
    setConfirmAction(null);
  };

  return (
    <div
      className="screen screen--game"
      style={
        {
          "--cell-feedback-duration": `${CELL_FEEDBACK_MS}ms`,
        } as React.CSSProperties
      }
    >
      <header className="game-header">
        <button
          type="button"
          className="btn-icon"
          aria-label="Leave game"
          onClick={() => setConfirmAction("leave")}
        >
          <LeaveIcon />
        </button>

        <GameTimer secondsLeft={secondsLeft} />

        <button
          type="button"
          className="btn-icon"
          aria-label="New game"
          onClick={() => setConfirmAction("newGame")}
        >
          <NewGameIcon />
        </button>
      </header>

      <div className="game-board-area">
        <BoardPanel
          board={board}
          boardRef={boardRef}
          isSelected={selection.isSelected}
          cellFeedback={cellFeedback}
          path={selection.path}
          tapMode={selection.mode === "tap"}
          onCellTap={selection.handleCellTap}
          disabled={!isPlaying}
          handlers={selection.boardHandlers}
          inputMode={selection.mode}
          onInputModeChange={selection.setMode}
          onRotateBoard={onRotateBoard}
          onClearSelection={selection.clearPath}
          foundWords={foundWords}
          currentWord={selection.currentWord}
          isSelecting={isSelecting}
          displayScore={displayScore}
          joinWord={joinWord}
          onJoinComplete={handleJoinComplete}
        />
      </div>

      <ScoreFloat bump={scoreBump} onComplete={onClearScoreBump} />

      <ConfirmModal
        open={confirmAction === "leave"}
        title="Leave game?"
        message="You'll return to the home screen and your current progress will be lost."
        confirmLabel="Leave"
        cancelLabel="Keep playing"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        open={confirmAction === "newGame"}
        title="Start new game?"
        message="This will reset the board, timer, and score."
        confirmLabel="New game"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
