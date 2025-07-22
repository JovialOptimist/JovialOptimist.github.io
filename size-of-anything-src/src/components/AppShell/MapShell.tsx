// src/components/Map/MapShell.tsx
import React from "react";
import { MapView } from "../Map/MapView";
import { MapProvider } from "../../context/MapContext";
import { DiscoveriesPanel } from "../Panels/DiscoveriesPanel";
import "../../styles/global.css";

export const MapShell: React.FC = () => {
  return (
    <MapProvider>
      <div id="mapDiscoverContainer">
        {/* Map + floating panels */}
        <MapView />

        {/* Discoveries panel on the right */}
        <DiscoveriesPanel />
      </div>
    </MapProvider>
  );
};
