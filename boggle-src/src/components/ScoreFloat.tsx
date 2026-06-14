import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ScoreBump = {
  id: number;
  points: number;
  x: number;
  y: number;
};

type Motion = {
  id: number;
  points: number;
  x: number;
  y: number;
};

type Props = {
  bump: ScoreBump | null;
  onComplete: () => void;
};

export function ScoreFloat({ bump, onComplete }: Props) {
  const [motion, setMotion] = useState<Motion | null>(null);

  useLayoutEffect(() => {
    if (!bump) return;

    setMotion({
      id: bump.id,
      points: bump.points,
      x: bump.x,
      y: bump.y,
    });
  }, [bump]);

  const handleAnimationEnd = () => {
    setMotion(null);
    onComplete();
  };

  if (!motion) return null;

  return createPortal(
    <span
      key={motion.id}
      className="score-float"
      style={{ left: motion.x, top: motion.y }}
      onAnimationEnd={handleAnimationEnd}
    >
      +{motion.points}
    </span>,
    document.body,
  );
}
