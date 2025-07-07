// src/components/Map/MapView.tsx
import React, { useEffect, useRef } from "react";
import { useMapContext } from "../../context/MapContext";
import "leaflet/dist/leaflet.css";

export const MapView: React.FC = () => {
  const { mapReady } = useMapContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The map is initialized in MapContext; we just ensure the container is ready
  }, [mapReady]);

  return <div ref={mapContainerRef} className="w-full h-full z-0" id="map" />;
};
