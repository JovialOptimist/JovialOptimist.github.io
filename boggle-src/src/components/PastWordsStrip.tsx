import type { FoundWord } from "../game/types";

type Props = {
  words: FoundWord[];
};

export function PastWordsStrip({ words }: Props) {
  const newestFirst = [...words].reverse();

  return (
    <div className="past-words-strip">
      <div className="past-words-strip__track">
        {newestFirst.length === 0 ? (
          <span className="past-words-strip__empty">&nbsp;</span>
        ) : (
          newestFirst.map((w, i) => (
            <span key={`${w.word}-${words.length - 1 - i}`} className="past-words-strip__word">
              {w.word}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
