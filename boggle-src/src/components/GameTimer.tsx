import { formatTime } from "../game/scoring";

type Props = {
  secondsLeft: number;
  freeplay?: boolean;
  paused?: boolean;
  onPause: () => void;
};

export function GameTimer({
  secondsLeft,
  freeplay = false,
  paused = false,
  onPause,
}: Props) {
  const timeDisplay = freeplay ? "Free" : formatTime(secondsLeft);

  if (paused) {
    return (
      <div className="game-timer game-timer--paused" aria-hidden="true">
        <span className="game-timer__label">Paused</span>
        <span className="game-timer__value">{timeDisplay}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="game-timer game-timer--tappable"
      onClick={onPause}
      aria-label={`Pause game — ${timeDisplay} remaining`}
    >
      <span className="game-timer__label">Time</span>
      <span className="game-timer__value" aria-live="off">
        {timeDisplay}
      </span>
    </button>
  );
}
