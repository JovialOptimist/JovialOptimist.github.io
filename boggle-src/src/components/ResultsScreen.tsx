import type { FoundWord } from "../game/types";

type Props = {
  words: FoundWord[];
  totalScore: number;
  onPlayAgain: () => void;
  onHome: () => void;
};

export function ResultsScreen({
  words,
  totalScore,
  onPlayAgain,
  onHome,
}: Props) {
  return (
    <div className="screen screen--results">
      <header className="results-header">
        <h1>Time&apos;s up!</h1>
        <p className="results-score">{totalScore} points</p>
        <p className="results-count">{words.length} words found</p>
      </header>

      <ul className="results-list">
        {words.length === 0 ? (
          <li className="results-empty">No words found this round.</li>
        ) : (
          words.map((w) => (
            <li key={w.word}>
              <span>{w.word}</span>
              <span>{w.points}</span>
            </li>
          ))
        )}
      </ul>

      <div className="results-actions">
        <button type="button" className="btn-primary" onClick={onPlayAgain}>
          Play Again
        </button>
        <button type="button" className="btn-secondary" onClick={onHome}>
          Home
        </button>
      </div>
    </div>
  );
}
