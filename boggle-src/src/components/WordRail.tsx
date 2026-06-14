import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { FoundWord, InputMode, JoinWord } from "../game/types";
import { CurrentWord } from "./CurrentWord";
import { WordHistory } from "./WordHistory";

const JOIN_ANIM_MS = 450;

export type { JoinWord } from "../game/types";

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
  const [slotWidthPx, setSlotWidthPx] = useState(0);
  const [slotOpen, setSlotOpen] = useState(false);

  const newestFirst = [...foundWords].reverse();
  const hideNewestDuringJoin =
    joinWord !== null &&
    newestFirst.length > 0 &&
    newestFirst[0]!.word.toUpperCase() === joinWord.word.toUpperCase();

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

  return (
    <div className="word-strip">
      <CurrentWord
        ref={currentRef}
        currentWord={currentWord}
        isSelecting={isSelecting}
        inputMode={inputMode}
      />

      <WordHistory
        ref={historyTrackRef}
        foundWords={foundWords}
        joinWord={joinWord}
        slotOpen={slotOpen}
        slotWidthPx={slotWidthPx}
        hideNewestDuringJoin={hideNewestDuringJoin}
      />

      <span ref={measureRef} className="word-strip__measure" aria-hidden="true" />

      {flyer && (
        <span
          key={flyer.key}
          className={`word-strip__flyer ${flyerActive ? "word-strip__flyer--active" : ""}`}
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
