import { useCallback, useEffect, useRef, useState } from "react";
import type { Board as BoardType, CellFeedback, Coord, FoundWord } from "../game/types";
import { CELL_FEEDBACK_MS } from "../game/types";
import type { SubmitOutcome } from "../hooks/useGame";
import { useBoardSelection } from "../hooks/useBoardSelection";
import { BoardPanel } from "./BoardPanel";
import { GameTimer } from "./GameTimer";
import { ScoreFloat } from "./ScoreFloat";
import type { JoinWord } from "./WordRail";

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
};

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
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellFeedback, setCellFeedback] = useState<CellFeedback>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackKeyRef = useRef(0);
  const joinKeyRef = useRef(0);
  const [joinWord, setJoinWord] = useState<JoinWord | null>(null);

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

  return (
    <div
      className="screen screen--game"
      style={
        {
          "--cell-feedback-duration": `${CELL_FEEDBACK_MS}ms`,
        } as React.CSSProperties
      }
    >
      <GameTimer secondsLeft={secondsLeft} urgent={secondsLeft <= 30} />

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
    </div>
  );
}
