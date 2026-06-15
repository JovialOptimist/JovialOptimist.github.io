import type { BoardSize, GameSettings, TimeMode } from "../game/settings";
import { boardSizeLabel, gameModeLabel, timeModeLabel } from "../game/settings";

type Props = {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onStart: () => void;
  error?: string | null;
};

const BOARD_SIZES: BoardSize[] = [4, 5, 6];
const TIME_MODES: TimeMode[] = [60, 180, 300, "freeplay"];

export function HomeScreen({
  settings,
  onSettingsChange,
  onStart,
  error,
}: Props) {
  const setBoardSize = (boardSize: BoardSize) => {
    onSettingsChange({ ...settings, boardSize });
  };

  const setTimeMode = (timeMode: TimeMode) => {
    onSettingsChange({ ...settings, timeMode });
  };

  return (
    <div className="screen screen--home">
      <header className="home-header">
        <h1>Boggle</h1>
        <p className="home-subtitle">{gameModeLabel(settings)}</p>
      </header>

      <section className="home-settings" aria-label="Game settings">
        <div className="home-setting">
          <span className="home-setting__label">Board size</span>
          <div className="setting-toggle" role="group" aria-label="Board size">
            {BOARD_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={settings.boardSize === size ? "active" : ""}
                aria-pressed={settings.boardSize === size}
                onClick={() => setBoardSize(size)}
              >
                {boardSizeLabel(size)}
              </button>
            ))}
          </div>
        </div>

        <div className="home-setting">
          <span className="home-setting__label">Game time</span>
          <div className="setting-toggle" role="group" aria-label="Game time">
            {TIME_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={settings.timeMode === mode ? "active" : ""}
                aria-pressed={settings.timeMode === mode}
                onClick={() => setTimeMode(mode)}
              >
                {timeModeLabel(mode)}
              </button>
            ))}
          </div>
        </div>
      </section>

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
          <li>Double-letter cubes (Qu, Th…) count as two letters on 6×6 boards</li>
          <li>Blocked squares cannot be used on 6×6 boards</li>
        </ul>
      </section>
    </div>
  );
}
