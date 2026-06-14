import { formatTime } from "../game/scoring";

type Props = {
  secondsLeft: number;
};

export function GameTimer({ secondsLeft }: Props) {
  return (
    <div className="game-timer">
      <span className="game-timer__label">Time</span>
      <span className="game-timer__value" aria-live="off">
        {formatTime(secondsLeft)}
      </span>
    </div>
  );
}
