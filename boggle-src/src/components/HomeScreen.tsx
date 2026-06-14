type Props = {
  onStart: () => void;
  error?: string | null;
};

export function HomeScreen({ onStart, error }: Props) {
  return (
    <div className="screen screen--home">
      <header className="home-header">
        <h1>Boggle</h1>
        <p className="home-subtitle">Super Big · 6×6 · 3 minutes</p>
      </header>

      <div className="home-actions">
        <button type="button" className="btn-primary" onClick={onStart}>
          Single Player
        </button>
        <button type="button" className="btn-secondary" disabled>
          Multiplayer
          <span className="badge">Coming soon</span>
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <section className="home-rules">
        <h2>How to play</h2>
        <ul>
          <li>Find words of 4+ letters by connecting adjacent letters</li>
          <li>Drag to connect letters — words validate when you release</li>
          <li>Tap mode validates after each letter; tap the first letter to reset</li>
          <li>Double-letter cubes (Qu, Th…) count as two letters</li>
          <li>Blocked squares cannot be used</li>
        </ul>
      </section>
    </div>
  );
}
