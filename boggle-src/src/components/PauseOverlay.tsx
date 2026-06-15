import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onResume: () => void;
};

export function PauseOverlay({ open, onResume }: Props) {
  const resumeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    resumeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onResume();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onResume]);

  if (!open) return null;

  return (
    <div
      className="pause-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-overlay-title"
    >
      <div className="pause-overlay__card">
        <h2 id="pause-overlay-title" className="pause-overlay__title">
          Paused
        </h2>
        <button
          ref={resumeRef}
          type="button"
          className="btn-primary pause-overlay__resume"
          onClick={onResume}
        >
          Resume
        </button>
      </div>
    </div>
  );
}
