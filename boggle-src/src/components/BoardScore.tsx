type Props = {
  displayScore: number;
};

export function BoardScore({ displayScore }: Props) {
  return (
    <div className="board-score">
      <span className="board-score__label">Score</span>
      <span className="board-score__value" aria-live="polite">
        {displayScore}
      </span>
    </div>
  );
}
