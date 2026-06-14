import { formatTime } from "../game/scoring";

type Props = {
  secondsLeft: number;
  urgent?: boolean;
};

export function Timer({ secondsLeft, urgent }: Props) {
  return (
    <div className={`timer ${urgent ? "timer--urgent" : ""}`} aria-live="polite">
      {formatTime(secondsLeft)}
    </div>
  );
}
