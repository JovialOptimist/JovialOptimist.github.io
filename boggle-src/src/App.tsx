import { useGame } from "./hooks/useGame";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import "./styles/game.css";

export default function App() {
  const game = useGame();

  if (game.phase === "loading") {
    return (
      <div className="app">
        <div className="screen screen--loading">
          <p>Loading dictionary…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {game.phase === "home" && (
        <HomeScreen onStart={() => void game.startGame()} error={game.loadError} />
      )}

      {game.phase === "playing" && game.board && (
        <GameScreen
          board={game.board}
          displayScore={game.displayScore}
          foundWords={game.foundWords}
          secondsLeft={game.secondsLeft}
          isPlaying={game.isPlaying}
          scoreBump={game.scoreBump}
          onSubmitPath={game.submitPath}
          onRotateBoard={game.rotateBoard}
          onClearScoreBump={game.clearScoreBump}
          onLeave={game.goHome}
          onNewGame={() => void game.startGame()}
        />
      )}

      {game.phase === "results" && (
        <ResultsScreen
          words={game.foundWords}
          totalScore={game.totalScore}
          onPlayAgain={game.playAgain}
          onHome={game.goHome}
        />
      )}
    </div>
  );
}
