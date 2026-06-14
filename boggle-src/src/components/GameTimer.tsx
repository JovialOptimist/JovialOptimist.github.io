import { formatTime } from "../game/scoring";

type Props = {
  secondsLeft: number;
  urgent?: boolean;
};

export function GameTimer({ secondsLeft, urgent }: Props) {
  return (
    <div className="game-timer">
      <span className="game-timer__label">Time</span>
      <span
        className={`game-timer__value ${urgent ? "game-timer__value--urgent" : ""}`}
        aria-live="off"
      >
        {formatTime(secondsLeft)}
      </span>
    </div>
  );
}
