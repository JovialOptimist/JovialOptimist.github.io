import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { FoundWord, InputMode } from "../game/types";

const JOIN_ANIM_MS = 450;
const HISTORY_GAP_PX = 10;

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
  const historyTrackRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [flyerActive, setFlyerActive] = useState(false);
  const [historySlidePx, setHistorySlidePx] = useState(0);
  const [slideActive, setSlideActive] = useState(false);

  const newestFirst = [...foundWords].reverse();
  const hideNewestDuringJoin =
    joinWord !== null &&
    newestFirst.length > 0 &&
    newestFirst[0]!.word.toUpperCase() === joinWord.word.toUpperCase();
  const visibleHistory = hideNewestDuringJoin ? newestFirst.slice(1) : newestFirst;

  useLayoutEffect(() => {
    if (!joinWord) {
      setHistorySlidePx(0);
      setSlideActive(false);
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
    const slidePx = wordWidth + HISTORY_GAP_PX;

    const from = currentEl.getBoundingClientRect();
    const historyRect = historyEl.getBoundingClientRect();
    const startX = from.left + from.width / 2;
    const startY = from.top + from.height / 2;
    const targetX = historyRect.left + 12;
    const targetY = historyRect.top + historyRect.height / 2;

    setHistorySlidePx(slidePx);
    setSlideActive(false);
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
      setFlyerActive(true);
      setSlideActive(true);
    });

    const timer = window.setTimeout(() => {
      setFlyer(null);
      setFlyerActive(false);
      setSlideActive(false);
      setHistorySlidePx(0);
      onJoinComplete();
    }, JOIN_ANIM_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [flyer, onJoinComplete]);

  const hint = inputMode === "drag" ? "Drag letters…" : "Tap letters…";

  return (
    <div className="word-rail">
      <div className="word-rail__current" ref={currentRef}>
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
        <div
          ref={historyTrackRef}
          className={`word-rail__history-track ${slideActive ? "word-rail__history-track--sliding" : ""}`}
          style={
            historySlidePx > 0
              ? ({ "--history-slide": `${historySlidePx}px` } as CSSProperties)
              : undefined
          }
        >
          {visibleHistory.length === 0 ? (
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
