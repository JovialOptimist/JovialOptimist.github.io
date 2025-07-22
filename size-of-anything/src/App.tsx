// src/App.tsx
import React from "react";
import { AppProvider } from "./context/AppContext";
import { TitleBar, SettingsModal, MenuDropdown } from "./components/AppShell";
import { MapShell } from "./components/AppShell/MapShell";
import "./styles/global.css";

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen">
        <TitleBar />
        <div className="flex-1 overflow-hidden">
          <MapShell />
        </div>
        <SettingsModal />
        <MenuDropdown />
      </div>
    </AppProvider>
  );
};

export default App;
