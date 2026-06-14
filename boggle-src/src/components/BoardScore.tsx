type Props = {
  displayScore: number;
};

export function BoardScore({ displayScore }: Props) {
  return (
    <div className="board-score" aria-label={`Score ${displayScore}`}>
      <span className="board-score__value" aria-live="polite">
        {displayScore}
      </span>
    </div>
  );
}
