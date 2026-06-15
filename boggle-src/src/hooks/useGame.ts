import { useCallback, useEffect, useRef, useState } from "react";
import { loadDictionary } from "../data/loadDictionary";
import { generateBoard } from "../game/generateBoard";
import {
  clearSavedGame,
  elapsedSecondsSince,
  hasSavedGame,
  loadSavedGame,
  saveGame,
} from "../game/gameSave";
import { rotateBoardClockwise } from "../game/rotateBoard";
import { scoreWord } from "../game/scoring";
import {
  loadSettings,
  saveSettings,
  timeLimitToMode,
  timeModeSeconds,
  type GameSettings,
} from "../game/settings";
import type {
  Board,
  FoundWord,
  GamePhase,
  SubmitResult,
} from "../game/types";
import {
  pathEffectiveLength,
  validatePath,
} from "../game/validatePath";

export type SubmitOutcome = {
  result: SubmitResult;
  points: number;
  word: string;
};

function initialPhase(): GamePhase {
  return hasSavedGame() ? "loading" : "home";
}

function initialSecondsLeft(settings: GameSettings): number {
  return timeModeSeconds(settings.timeMode) ?? 0;
}

export function useGame() {
  const [phase, setPhase] = useState<GamePhase>(initialPhase);
  const [settings, setSettingsState] = useState<GameSettings>(loadSettings);
  const [board, setBoard] = useState<Board | null>(null);
  const [dictionary, setDictionary] = useState<Set<string> | null>(null);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number | null>(
    timeModeSeconds(settings.timeMode),
  );
  const [secondsLeft, setSecondsLeft] = useState(() => initialSecondsLeft(settings));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [scoreBump, setScoreBump] = useState<{
    id: number;
    points: number;
    x: number;
    y: number;
  } | null>(null);
  const foundSetRef = useRef(new Set<string>());
  const bumpIdRef = useRef(0);
  const ratchetRef = useRef<number | null>(null);
  const restoredRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  const setSettings = useCallback((next: GameSettings) => {
    setSettingsState(next);
    saveSettings(next);
  }, []);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const saved = loadSavedGame();
    if (!saved) {
      setPhase((p) => (p === "loading" ? "home" : p));
      return;
    }

    void (async () => {
      try {
        const dict = await loadDictionary();
        setDictionary(dict);

        const elapsed = saved.isPaused ? 0 : elapsedSecondsSince(saved.savedAt);
        const isFreeplay = saved.timeLimitSeconds === null;
        const remaining = isFreeplay
          ? 0
          : saved.secondsLeft - elapsed;

        const restoredSettings: GameSettings = {
          boardSize: saved.boardSize,
          timeMode: timeLimitToMode(saved.timeLimitSeconds),
        };
        setSettingsState(restoredSettings);
        saveSettings(restoredSettings);
        setTimeLimitSeconds(saved.timeLimitSeconds);
        setBoard(saved.board);
        setFoundWords(saved.foundWords);
        foundSetRef.current = new Set(saved.foundWordsSet);
        setTotalScore(saved.totalScore);
        setDisplayScore(saved.totalScore);

        if (saved.phase === "results" || (!isFreeplay && remaining <= 0)) {
          setSecondsLeft(0);
          setPhase("results");
          return;
        }

        setSecondsLeft(isFreeplay ? 0 : remaining);
        setIsPaused(saved.isPaused);
        setPhase("playing");
      } catch {
        clearSavedGame();
        setPhase("home");
      }
    })();
  }, []);

  useEffect(() => {
    if (phase !== "playing" || !board || timeLimitSeconds === null || isPaused) return;

    if (secondsLeft <= 0) {
      setPhase("results");
      return;
    }

    const id = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase, secondsLeft, board, timeLimitSeconds, isPaused]);

  useEffect(() => {
    if (phase !== "playing" && phase !== "results") return;
    if (!board) return;

    saveGame({
      phase,
      boardSize: settings.boardSize,
      timeLimitSeconds,
      board,
      foundWords,
      foundWordsSet: [...foundSetRef.current],
      totalScore,
      secondsLeft: timeLimitSeconds === null ? 0 : secondsLeft,
      savedAt: Date.now(),
      isPaused,
    });
  }, [
    phase,
    board,
    foundWords,
    totalScore,
    secondsLeft,
    settings.boardSize,
    timeLimitSeconds,
    isPaused,
  ]);

  useEffect(() => {
    return () => {
      if (ratchetRef.current !== null) {
        window.clearInterval(ratchetRef.current);
      }
    };
  }, []);

  const ratchetScoreTo = useCallback((target: number) => {
    if (ratchetRef.current !== null) {
      window.clearInterval(ratchetRef.current);
    }

    ratchetRef.current = window.setInterval(() => {
      setDisplayScore((current) => {
        if (current >= target) {
          if (ratchetRef.current !== null) {
            window.clearInterval(ratchetRef.current);
            ratchetRef.current = null;
          }
          return target;
        }
        const step = Math.max(1, Math.ceil((target - current) / 12));
        return Math.min(target, current + step);
      });
    }, 40);
  }, []);

  const startGame = useCallback(async () => {
    setPhase("loading");
    setLoadError(null);
    clearSavedGame();
    try {
      const dict = dictionary ?? (await loadDictionary());
      setDictionary(dict);
      const limit = timeModeSeconds(settings.timeMode);
      setTimeLimitSeconds(limit);
      setBoard(generateBoard(settings.boardSize));
      setFoundWords([]);
      foundSetRef.current = new Set();
      setSecondsLeft(limit ?? 0);
      setTotalScore(0);
      setDisplayScore(0);
      setScoreBump(null);
      setIsPaused(false);
      setPhase("playing");
    } catch {
      setLoadError("Could not load dictionary. Please try again.");
      setPhase("home");
    }
  }, [dictionary, settings]);

  const submitPath = useCallback(
    (
      path: { row: number; col: number }[],
      origin?: { x: number; y: number },
    ): SubmitOutcome => {
      const empty: SubmitOutcome = { result: "invalid", points: 0, word: "" };
      const timedOut =
        timeLimitSeconds !== null && secondsLeft <= 0;

      if (phase !== "playing" || isPaused || timedOut || !board || !dictionary) {
        return { ...empty, result: "ended" };
      }

      if (path.length === 0) {
        return empty;
      }

      const result = validatePath(board, path, dictionary);
      if (!result.valid) {
        return { ...empty, result: result.reason === "tooShort" ? "tooShort" : "invalid", word: result.word };
      }

      if (foundSetRef.current.has(result.word)) {
        return { ...empty, result: "duplicate", word: result.word };
      }

      const effectiveLen = pathEffectiveLength(board, path);
      const points = scoreWord(effectiveLen);
      foundSetRef.current.add(result.word);
      setFoundWords((prev) => [...prev, { word: result.word, points }]);

      setTotalScore((prev) => {
        const newTotal = prev + points;
        ratchetScoreTo(newTotal);
        return newTotal;
      });

      bumpIdRef.current += 1;
      if (origin) {
        setScoreBump({ id: bumpIdRef.current, points, x: origin.x, y: origin.y });
      }

      return { result: "valid", points, word: result.word };
    },
    [board, dictionary, phase, isPaused, ratchetScoreTo, secondsLeft, timeLimitSeconds],
  );

  const rotateBoard = useCallback(() => {
    setBoard((current) => (current ? rotateBoardClockwise(current) : current));
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((paused) => !paused);
  }, []);

  const isFreeplay = timeLimitSeconds === null;
  const isPlaying =
    phase === "playing" && (isFreeplay || secondsLeft > 0) && !isPaused;

  return {
    phase,
    settings,
    setSettings,
    board,
    foundWords,
    totalScore,
    displayScore,
    scoreBump,
    secondsLeft,
    isFreeplay,
    isPaused,
    loadError,
    isPlaying,
    startGame,
    submitPath,
    rotateBoard,
    togglePause,
    clearScoreBump: () => setScoreBump(null),
    goHome: () => {
      clearSavedGame();
      setIsPaused(false);
      setPhase("home");
    },
    playAgain: () => {
      void startGame();
    },
  };
}
