import { useLayoutEffect, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { scoreFloatFontRem } from "../game/scoring";

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

  const floatStyle: CSSProperties = {
    left: motion.x,
    top: motion.y,
    fontSize: `${scoreFloatFontRem(motion.points)}rem`,
  };

  return createPortal(
    <span
      key={motion.id}
      className="score-float"
      style={floatStyle}
      onAnimationEnd={handleAnimationEnd}
    >
      +{motion.points}
    </span>,
    document.body,
  );
}
