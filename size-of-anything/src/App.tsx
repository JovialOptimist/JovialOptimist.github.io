// src/App.tsx
import React from "react";
import { AppProvider } from "./context/AppContext";
import { TitleBar, SettingsModal, MenuDropdown } from "./components/AppShell";
import { MapProvider } from "./context/MapContext";
import { MapView, MapControls } from "./components/Map";
import {
  CreationPanel,
  ActiveElementPanel,
  DiscoveriesPanel,
} from "./components/Panels";

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen">
        <div className="flex flex-col items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
          <TitleBar />
          <SettingsModal />
          <MenuDropdown />
        </div>
        <div className="flex-1 overflow-hidden">
          <MapProvider>
            <MapControls />
            <MapView />
            {/* other map-linked components */}
          </MapProvider>
          <CreationPanel />
        </div>
      </div>
    </AppProvider>
  );
};

export default App;
