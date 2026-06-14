import { formatTime } from "../game/scoring";

type Props = {
  displayScore: number;
  secondsLeft: number;
  urgent?: boolean;
};

export function ScoreHeader({ displayScore, secondsLeft, urgent }: Props) {
  return (
    <div className="score-header">
      <div className="stat-block">
        <span className="stat-block__label">Time</span>
        <span
          className={`stat-block__value ${urgent ? "stat-block__value--urgent" : ""}`}
        >
          {formatTime(secondsLeft)}
        </span>
      </div>
      <div className="stat-block stat-block--score">
        <span className="stat-block__label">Score</span>
        <span className="stat-block__value stat-block__value--score" aria-live="polite">
          {displayScore}
        </span>
      </div>
    </div>
  );
}
