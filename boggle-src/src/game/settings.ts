export type BoardSize = 4 | 5 | 6;

export type TimeMode = 60 | 180 | 300 | "freeplay";

export type GameSettings = {
  boardSize: BoardSize;
  timeMode: TimeMode;
};

export const DEFAULT_BOARD_SIZE: BoardSize = 6;
export const DEFAULT_TIME_MODE: TimeMode = 180;

const SETTINGS_KEY = "boggle-settings";

export function timeModeSeconds(mode: TimeMode): number | null {
  if (mode === "freeplay") return null;
  return mode;
}

export function boardSizeLabel(size: BoardSize): string {
  return `${size}×${size}`;
}

export function timeModeLabel(mode: TimeMode): string {
  switch (mode) {
    case 60:
      return "1 min";
    case 180:
      return "3 mins";
    case 300:
      return "5 mins";
    case "freeplay":
      return "Free play";
  }
}

export function timeLimitToMode(limit: number | null): TimeMode {
  if (limit === null) return "freeplay";
  if (limit === 60 || limit === 180 || limit === 300) return limit;
  return DEFAULT_TIME_MODE;
}

export function gameModeLabel(settings: GameSettings): string {
  return `${boardSizeLabel(settings.boardSize)} · ${timeModeLabel(settings.timeMode)}`;
}

function isBoardSize(value: unknown): value is BoardSize {
  return value === 4 || value === 5 || value === 6;
}

function isTimeMode(value: unknown): value is TimeMode {
  return value === 60 || value === 180 || value === 300 || value === "freeplay";
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return { boardSize: DEFAULT_BOARD_SIZE, timeMode: DEFAULT_TIME_MODE };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { boardSize: DEFAULT_BOARD_SIZE, timeMode: DEFAULT_TIME_MODE };
    }
    const data = parsed as Partial<GameSettings>;
    return {
      boardSize: isBoardSize(data.boardSize) ? data.boardSize : DEFAULT_BOARD_SIZE,
      timeMode: isTimeMode(data.timeMode) ? data.timeMode : DEFAULT_TIME_MODE,
    };
  } catch {
    return { boardSize: DEFAULT_BOARD_SIZE, timeMode: DEFAULT_TIME_MODE };
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable */
  }
}
