// src/components/Map/MapShell.tsx
import React from "react";
import { MapView } from "../Map/MapView";
import { MapControls } from "../Map/MapControls";
import { MapProvider } from "../../context/MapContext";
import { CreationPanel } from "../Panels/CreationPanel/CreationPanel";
import { ActiveElementPanel } from "../Panels/ActiveElementPanel";
import { DiscoveriesPanel } from "../Panels/DiscoveriesPanel";
import "../../styles/global.css";

export const MapShell: React.FC = () => {
  return (
    <MapProvider>
      <div className="flex w-full h-full">
        {/* Map + floating panels */}
        <div className="relative flex-1 w-80 h-full">
          <MapView />
          <MapControls />
        </div>

        {/* Discoveries panel on the right */}
        <div
          id="discoveriesPanel"
          className="w-20 h-full overflow-y-auto border-l border-gray-300"
        >
          <DiscoveriesPanel />
        </div>
      </div>
    </MapProvider>
  );
};
