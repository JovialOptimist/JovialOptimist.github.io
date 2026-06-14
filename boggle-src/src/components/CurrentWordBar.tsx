type Props = {
  currentWord: string;
  lastWord: string;
  isSelecting: boolean;
};

export function CurrentWordBar({ currentWord, lastWord, isSelecting }: Props) {
  const display = isSelecting ? currentWord : lastWord;
  const isPlaceholder = !isSelecting && lastWord.length > 0;

  return (
    <div className="current-word-bar">
      <div
        className={`current-word-bar__word ${isPlaceholder ? "current-word-bar__word--placeholder" : ""}`}
        aria-live="polite"
      >
        {display || "\u00a0"}
      </div>
    </div>
  );
}
