import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { FoundWord, InputMode } from "../game/types";

const JOIN_ANIM_MS = 450;
const CURRENT_H_PAD = 24;
const CURRENT_DEFAULT_FRACTION = 0.42;
const CURRENT_MAX_FRACTION = 0.78;

export type JoinWord = {
  word: string;
  key: number;
};

type Props = {
  foundWords: FoundWord[];
  currentWord: string;
  isSelecting: boolean;
  inputMode: InputMode;
  joinWord: JoinWord | null;
  onJoinComplete: () => void;
};

type Flyer = {
  word: string;
  key: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
};

export function WordRail({
  foundWords,
  currentWord,
  isSelecting,
  inputMode,
  joinWord,
  onJoinComplete,
}: Props) {
  const currentRef = useRef<HTMLDivElement>(null);
  const currentMeasureRef = useRef<HTMLSpanElement>(null);
  const historyTrackRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [flyerActive, setFlyerActive] = useState(false);
  const [slotWidthPx, setSlotWidthPx] = useState(0);
  const [slotOpen, setSlotOpen] = useState(false);
  const [currentSlotWidthPx, setCurrentSlotWidthPx] = useState<number | null>(null);

  const newestFirst = [...foundWords].reverse();
  const hideNewestDuringJoin =
    joinWord !== null &&
    newestFirst.length > 0 &&
    newestFirst[0]!.word.toUpperCase() === joinWord.word.toUpperCase();
  const visibleHistory = hideNewestDuringJoin ? newestFirst.slice(1) : newestFirst;

  useLayoutEffect(() => {
    if (!joinWord) {
      setSlotWidthPx(0);
      setSlotOpen(false);
      return;
    }

    const currentEl = currentRef.current;
    const historyEl = historyTrackRef.current;
    const measureEl = measureRef.current;
    if (!currentEl || !historyEl || !measureEl) {
      onJoinComplete();
      return;
    }

    measureEl.textContent = joinWord.word;
    const wordWidth = measureEl.getBoundingClientRect().width;

    const from = currentEl.getBoundingClientRect();
    const historyRect = historyEl.getBoundingClientRect();
    const startX = from.left + from.width / 2;
    const startY = from.top + from.height / 2;
    // Flyer is center-anchored; target the center of the word's final slot.
    const targetX = historyRect.left + 12 + wordWidth / 2;
    const targetY = historyRect.top + historyRect.height / 2;

    setSlotWidthPx(wordWidth);
    setSlotOpen(false);
    setFlyer({
      word: joinWord.word,
      key: joinWord.key,
      startX,
      startY,
      deltaX: targetX - startX,
      deltaY: targetY - startY,
    });
    setFlyerActive(false);
  }, [joinWord, onJoinComplete]);

  useEffect(() => {
    if (!flyer) return;

    const raf = requestAnimationFrame(() => {
      setSlotOpen(true);
      setFlyerActive(true);
    });

    const timer = window.setTimeout(() => {
      setFlyer(null);
      setFlyerActive(false);
      setSlotOpen(false);
      setSlotWidthPx(0);
      onJoinComplete();
    }, JOIN_ANIM_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [flyer, onJoinComplete]);

  useLayoutEffect(() => {
    if (!isSelecting || !currentWord) {
      setCurrentSlotWidthPx(null);
      return;
    }

    const rail = currentRef.current?.parentElement;
    const measureEl = currentMeasureRef.current;
    if (!rail || !measureEl) {
      setCurrentSlotWidthPx(null);
      return;
    }

    const updateWidth = () => {
      measureEl.textContent = currentWord;
      const wordWidth = measureEl.getBoundingClientRect().width;
      const defaultSlotWidth = rail.clientWidth * CURRENT_DEFAULT_FRACTION;
      const maxSlotWidth = rail.clientWidth * CURRENT_MAX_FRACTION;
      const needed = Math.ceil(wordWidth) + CURRENT_H_PAD;

      if (needed <= defaultSlotWidth) {
        setCurrentSlotWidthPx(null);
      } else {
        setCurrentSlotWidthPx(Math.min(needed, Math.ceil(maxSlotWidth)));
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [isSelecting, currentWord]);

  const hint = inputMode === "drag" ? "Drag letters…" : "Tap letters…";

  return (
    <div className="word-rail">
      <div
        className={`word-rail__current ${currentSlotWidthPx !== null ? "word-rail__current--sized" : ""}`}
        ref={currentRef}
        style={
          currentSlotWidthPx !== null
            ? ({ width: `${currentSlotWidthPx}px` } as CSSProperties)
            : undefined
        }
      >
        {isSelecting ? (
          <span className="word-rail__current-text" aria-live="polite">
            {currentWord || "\u00a0"}
          </span>
        ) : (
          <span className="word-rail__hint">{hint}</span>
        )}
      </div>

      <div className="word-rail__divider" aria-hidden="true" />

      <div className="word-rail__history">
        <div ref={historyTrackRef} className="word-rail__history-track">
          {joinWord && (
            <span
              className={`word-rail__join-slot ${slotOpen ? "word-rail__join-slot--open" : ""}`}
              style={
                slotWidthPx > 0
                  ? ({ "--slot-width": `${slotWidthPx}px` } as CSSProperties)
                  : undefined
              }
              aria-hidden="true"
            >
              <span className="word-rail__history-word">
                {joinWord.word}
              </span>
            </span>
          )}
          {visibleHistory.length === 0 && !joinWord ? (
            <span className="word-rail__history-empty">&nbsp;</span>
          ) : (
            visibleHistory.map((w, i) => (
              <span
                key={`${w.word}-${foundWords.length - 1 - i}`}
                className="word-rail__history-word"
              >
                {w.word}
              </span>
            ))
          )}
        </div>
      </div>

      <span ref={measureRef} className="word-rail__measure" aria-hidden="true" />
      <span
        ref={currentMeasureRef}
        className="word-rail__measure word-rail__measure--current"
        aria-hidden="true"
      />

      {flyer && (
        <span
          key={flyer.key}
          className={`word-rail__flyer ${flyerActive ? "word-rail__flyer--active" : ""}`}
          style={
            {
              left: `${flyer.startX}px`,
              top: `${flyer.startY}px`,
              "--join-dx": `${flyer.deltaX}px`,
              "--join-dy": `${flyer.deltaY}px`,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          {flyer.word}
        </span>
      )}
    </div>
  );
}
