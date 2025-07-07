// src/context/MapContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import L, { Map as LeafletMap } from "leaflet";

interface MapContextType {
  map: LeafletMap | null;
  mapReady: boolean;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const el = document.getElementById("map");
    if (el && !mapRef.current) {
      mapRef.current = L.map(el).setView([47.6062, -122.3321], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
      setMapReady(true);
    }
  }, []);

  return (
    <MapContext.Provider value={{ map: mapRef.current, mapReady }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context)
    throw new Error("useMapContext must be used within a MapProvider");
  return context;
};
