import { useCallback, useRef, useState, type RefObject } from "react";
import type { Board, Coord, InputMode } from "../game/types";
import { canAddCell, pathPreviewWord } from "../game/validatePath";
import { coordKey } from "../game/generateBoard";

const MODE_STORAGE_KEY = "boggle-input-mode";

function loadMode(): InputMode {
  try {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === "drag" || stored === "tap") return stored;
  } catch {
    /* ignore */
  }
  return "drag";
}

function saveMode(mode: InputMode) {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

function coordFromElement(el: Element | null): Coord | null {
  if (!el) return null;
  const cell = el.closest("[data-row][data-col]");
  if (!cell) return null;
  const row = Number(cell.getAttribute("data-row"));
  const col = Number(cell.getAttribute("data-col"));
  if (Number.isNaN(row) || Number.isNaN(col)) return null;
  return { row, col };
}

function sameCoord(a: Coord, b: Coord): boolean {
  return a.row === b.row && a.col === b.col;
}

type UseBoardSelectionOptions = {
  board: Board;
  boardRef?: RefObject<HTMLDivElement>;
  disabled?: boolean;
  /** Return true to clear the current path after validation. */
  onValidatePath: (path: Coord[]) => boolean;
  onSelectionStart?: () => void;
};

export function useBoardSelection({
  board,
  boardRef: externalBoardRef,
  disabled = false,
  onValidatePath,
  onSelectionStart,
}: UseBoardSelectionOptions) {
  const internalBoardRef = useRef<HTMLDivElement>(null);
  const boardRef = externalBoardRef ?? internalBoardRef;
  const [mode, setModeState] = useState<InputMode>(loadMode);
  const [path, setPath] = useState<Coord[]>([]);
  const draggingRef = useRef(false);
  const pathRef = useRef<Coord[]>([]);

  pathRef.current = path;

  const clearPath = useCallback(() => {
    setPath([]);
  }, []);

  const setMode = useCallback(
    (next: InputMode) => {
      setModeState(next);
      saveMode(next);
      clearPath();
    },
    [clearPath],
  );

  const tryAddCell = useCallback(
    (next: Coord, currentPath: Coord[]): Coord[] => {
      if (disabled) return currentPath;

      if (currentPath.length >= 2) {
        const prev = currentPath[currentPath.length - 2]!;
        if (sameCoord(prev, next)) {
          return currentPath.slice(0, -1);
        }
      }

      if (!canAddCell(board, currentPath, next)) {
        return currentPath;
      }

      return [...currentPath, next];
    },
    [board, disabled],
  );

  const runValidation = useCallback(
    (currentPath: Coord[]) => {
      if (currentPath.length === 0) return;
      const shouldClear = onValidatePath(currentPath);
      if (shouldClear) {
        setPath([]);
      }
    },
    [onValidatePath],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || mode !== "drag") return;
      const coord = coordFromElement(e.target as Element);
      if (!coord) return;

      onSelectionStart?.();
      draggingRef.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
      setPath(canAddCell(board, [], coord) ? [coord] : []);
    },
    [board, disabled, mode, onSelectionStart],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || mode !== "drag" || !draggingRef.current) return;
      e.preventDefault();

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const coord = coordFromElement(el);
      if (!coord) return;

      setPath((current) => {
        if (current.length === 0) return current;
        const last = current[current.length - 1]!;
        if (sameCoord(last, coord)) return current;
        return tryAddCell(coord, current);
      });
    },
    [disabled, mode, tryAddCell],
  );

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const currentPath = pathRef.current;
    if (currentPath.length > 1) {
      runValidation(currentPath);
    }
    setPath([]);
  }, [runValidation]);

  const handleCellTap = useCallback(
    (coord: Coord) => {
      if (disabled || mode !== "tap") return;

      setPath((current) => {
        if (current.length > 0 && sameCoord(current[0]!, coord)) {
          onSelectionStart?.();
          return [];
        }

        if (current.length === 0) {
          onSelectionStart?.();
        }

        const nextPath = tryAddCell(coord, current);
        if (nextPath !== current && nextPath.length > 0) {
          queueMicrotask(() => {
            const shouldClear = onValidatePath(nextPath);
            if (shouldClear) {
              setPath([]);
            }
          });
        }
        return nextPath;
      });
    },
    [disabled, mode, onSelectionStart, onValidatePath, tryAddCell],
  );

  const isSelected = useCallback(
    (row: number, col: number) =>
      path.some((p) => p.row === row && p.col === col),
    [path],
  );

  const currentWord = pathPreviewWord(board, path);

  return {
    mode,
    setMode,
    path,
    clearPath,
    currentWord,
    boardRef,
    isSelected,
    boardHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onPointerLeave: handlePointerUp,
    },
    handleCellTap,
    pathKeys: path.map((p) => coordKey(p.row, p.col)),
  };
}
