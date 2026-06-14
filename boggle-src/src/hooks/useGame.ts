import { useCallback, useEffect, useRef, useState } from "react";
import { loadDictionary } from "../data/loadDictionary";
import { generateBoard } from "../game/generateBoard";
import { rotateBoardClockwise } from "../game/rotateBoard";
import { scoreWord } from "../game/scoring";
import type {
  Board,
  FoundWord,
  GamePhase,
  SubmitResult,
} from "../game/types";
import { ROUND_SECONDS } from "../game/types";
import {
  pathEffectiveLength,
  validatePath,
} from "../game/validatePath";

export type SubmitOutcome = {
  result: SubmitResult;
  points: number;
  word: string;
};

export function useGame() {
  const [phase, setPhase] = useState<GamePhase>("home");
  const [board, setBoard] = useState<Board | null>(null);
  const [dictionary, setDictionary] = useState<Set<string> | null>(null);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
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

  useEffect(() => {
    if (phase !== "playing") return;

    if (secondsLeft <= 0) {
      setPhase("results");
      return;
    }

    const id = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase, secondsLeft]);

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
        return current + 1;
      });
    }, 40);
  }, []);

  const startGame = useCallback(async () => {
    setPhase("loading");
    setLoadError(null);
    try {
      const dict = dictionary ?? (await loadDictionary());
      setDictionary(dict);
      setBoard(generateBoard());
      setFoundWords([]);
      foundSetRef.current = new Set();
      setSecondsLeft(ROUND_SECONDS);
      setTotalScore(0);
      setDisplayScore(0);
      setScoreBump(null);
      setPhase("playing");
    } catch {
      setLoadError("Could not load dictionary. Please try again.");
      setPhase("home");
    }
  }, [dictionary]);

  const submitPath = useCallback(
    (
      path: { row: number; col: number }[],
      origin?: { x: number; y: number },
    ): SubmitOutcome => {
      const empty: SubmitOutcome = { result: "invalid", points: 0, word: "" };

      if (phase !== "playing" || secondsLeft <= 0 || !board || !dictionary) {
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
    [board, dictionary, phase, ratchetScoreTo, secondsLeft],
  );

  const rotateBoard = useCallback(() => {
    setBoard((current) => (current ? rotateBoardClockwise(current) : current));
  }, []);

  const isPlaying = phase === "playing" && secondsLeft > 0;

  return {
    phase,
    board,
    foundWords,
    totalScore,
    displayScore,
    scoreBump,
    secondsLeft,
    loadError,
    isPlaying,
    startGame,
    submitPath,
    rotateBoard,
    clearScoreBump: () => setScoreBump(null),
    goHome: () => setPhase("home"),
    playAgain: () => {
      void startGame();
    },
  };
}
