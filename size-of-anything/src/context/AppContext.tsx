// src/context/AppContext.tsx
import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AppContextType {
  settingsOpen: boolean;
  toggleSettingsModal: () => void;
  menuOpen: boolean;
  toggleMenu: () => void;
  units: "km2" | "mi2";
  setUnits: (units: "km2" | "mi2") => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [units, setUnits] = useState<"km2" | "mi2">("km2");
  const [highContrast, setHighContrast] = useState(false);

  const toggleSettingsModal = () => setSettingsOpen((prev) => !prev);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        settingsOpen,
        toggleSettingsModal,
        menuOpen,
        toggleMenu,
        units,
        setUnits,
        highContrast,
        toggleHighContrast,
      }}
    >
      <div data-theme={highContrast ? "high-contrast" : "default"}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within an AppProvider");
  return context;
};
