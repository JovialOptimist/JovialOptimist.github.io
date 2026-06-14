import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { InputMode } from "../game/types";

const CURRENT_H_PAD = 24;
const CURRENT_DEFAULT_FRACTION = 0.42;
const CURRENT_MAX_FRACTION = 0.78;

type Props = {
  currentWord: string;
  isSelecting: boolean;
  inputMode: InputMode;
};

export const CurrentWord = forwardRef<HTMLDivElement, Props>(function CurrentWord(
  { currentWord, isSelecting, inputMode },
  ref,
) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [slotWidthPx, setSlotWidthPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!isSelecting || !currentWord) {
      setSlotWidthPx(null);
      return;
    }

    const strip =
      typeof ref === "function"
        ? null
        : ref?.current?.parentElement;
    const measureEl = measureRef.current;
    if (!strip || !measureEl) {
      setSlotWidthPx(null);
      return;
    }

    const updateWidth = () => {
      measureEl.textContent = currentWord;
      const wordWidth = measureEl.getBoundingClientRect().width;
      const defaultSlotWidth = strip.clientWidth * CURRENT_DEFAULT_FRACTION;
      const maxSlotWidth = strip.clientWidth * CURRENT_MAX_FRACTION;
      const needed = Math.ceil(wordWidth) + CURRENT_H_PAD;

      if (needed <= defaultSlotWidth) {
        setSlotWidthPx(null);
      } else {
        setSlotWidthPx(Math.min(needed, Math.ceil(maxSlotWidth)));
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [currentWord, isSelecting, ref]);

  const hint = inputMode === "drag" ? "Drag letters…" : "Tap letters…";

  return (
    <>
      <div
        className={`current-word ${slotWidthPx !== null ? "current-word--sized" : ""}`}
        ref={ref}
        style={
          slotWidthPx !== null
            ? ({ width: `${slotWidthPx}px` } as CSSProperties)
            : undefined
        }
      >
        {isSelecting ? (
          <span className="current-word__text" aria-live="polite">
            {currentWord || "\u00a0"}
          </span>
        ) : (
          <span className="current-word__hint">{hint}</span>
        )}
      </div>

      <span
        ref={measureRef}
        className="word-strip__measure word-strip__measure--current"
        aria-hidden="true"
      />
    </>
  );
});
