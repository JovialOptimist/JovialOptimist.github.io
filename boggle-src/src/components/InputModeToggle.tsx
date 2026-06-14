import type { InputMode } from "../game/types";

type Props = {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
  disabled?: boolean;
};

export function InputModeToggle({ mode, onChange, disabled }: Props) {
  return (
    <div className="input-mode-toggle" role="group" aria-label="Input mode">
      <button
        type="button"
        className={mode === "drag" ? "active" : ""}
        onClick={() => onChange("drag")}
        disabled={disabled}
      >
        Drag
      </button>
      <button
        type="button"
        className={mode === "tap" ? "active" : ""}
        onClick={() => onChange("tap")}
        disabled={disabled}
      >
        Tap
      </button>
    </div>
  );
}
