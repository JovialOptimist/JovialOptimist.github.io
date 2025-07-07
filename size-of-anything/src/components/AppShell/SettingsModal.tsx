// src/components/AppShell/SettingsModal.tsx
import React from "react";
import { useAppContext } from "../../context/AppContext";
import { Modal } from "../UI/Modal";

export const SettingsModal: React.FC = () => {
  const {
    settingsOpen,
    toggleSettingsModal,
    units,
    setUnits,
    highContrast,
    toggleHighContrast,
  } = useAppContext();

  if (!settingsOpen) return null;

  return (
    <Modal onClose={toggleSettingsModal} title="Settings">
      <div className="space-y-4">
        <div>
          <label className="block font-semibold">Units</label>
          <select
            value={units}
            onChange={(e) => setUnits(e.target.value as "km2" | "mi2")}
            className="w-full border p-2 rounded"
          >
            <option value="km2">Kilometers²</option>
            <option value="mi2">Miles²</option>
          </select>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={toggleHighContrast}
            />
            <span>Enable High Contrast Mode</span>
          </label>
        </div>
      </div>
    </Modal>
  );
};
