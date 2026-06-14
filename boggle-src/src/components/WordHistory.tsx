import { forwardRef } from "react";
import type { CSSProperties } from "react";
import type { FoundWord, JoinWord } from "../game/types";

type Props = {
  foundWords: FoundWord[];
  joinWord: JoinWord | null;
  slotOpen: boolean;
  slotWidthPx: number;
  hideNewestDuringJoin: boolean;
};

export const WordHistory = forwardRef<HTMLDivElement, Props>(function WordHistory(
  { foundWords, joinWord, slotOpen, slotWidthPx, hideNewestDuringJoin },
  ref,
) {
  const newestFirst = [...foundWords].reverse();
  const visibleHistory = hideNewestDuringJoin ? newestFirst.slice(1) : newestFirst;

  return (
    <div className="word-history">
      <div ref={ref} className="word-history__track">
        {joinWord && (
          <span
            className={`word-history__join-slot ${slotOpen ? "word-history__join-slot--open" : ""}`}
            style={
              slotWidthPx > 0
                ? ({ "--slot-width": `${slotWidthPx}px` } as CSSProperties)
                : undefined
            }
            aria-hidden="true"
          >
            <span className="word-history__word">{joinWord.word}</span>
          </span>
        )}
        {visibleHistory.length === 0 && !joinWord ? (
          <span className="word-history__empty">&nbsp;</span>
        ) : (
          visibleHistory.map((w, i) => (
            <span
              key={`${w.word}-${foundWords.length - 1 - i}`}
              className="word-history__word"
            >
              {w.word}
            </span>
          ))
        )}
      </div>
    </div>
  );
});
