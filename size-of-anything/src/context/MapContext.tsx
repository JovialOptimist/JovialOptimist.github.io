// src/context/MapContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import L, { Map as LeafletMap } from "leaflet";
import { ActiveElementPanel, CreationPanel } from "../components/Panels";
import { createRoot } from "react-dom/client";
// import <script src="Leaflet.Control.Custom.js"></script>

// Extend Leaflet's type definitions to add Control.Button
declare global {
  namespace L {
    namespace Control {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let Panel: any;
      let Creationpanel: any;
    }
  }
}

interface MapContextType {
  map: LeafletMap | null;
  mapReady: boolean;
  polygons?:
    | {
        id: string;
        geojson: GeoJSON.Polygon | GeoJSON.MultiPolygon;
        color: string;
      }[]
    | null;
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
      mapRef.current = L.map(el, {
        zoomControl: false, // Disable default zoom control
      }).setView([47.6062, -122.3321], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
      L.control.scale().addTo(mapRef.current);
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(mapRef.current);

      L.Control.Panel = L.Control.extend({
        options: {
          position: "topright",
        },
        onAdd: function (map: LeafletMap) {
          var container = document.createElement("div");
          createRoot(container).render(<ActiveElementPanel />);

          // Stop map events from triggering through the panel
          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.disableScrollPropagation(container);

          return container;
        },
      });

      L.Control.Creationpanel = L.Control.extend({
        options: {
          position: "topleft",
        },
        onAdd: function (map: LeafletMap) {
          var container = document.createElement("div");
          // Pass the current map context to the CreationPanel
          const root = createRoot(container);
          root.render(
            <MapContext.Provider value={{ map: mapRef.current, mapReady }}>
              <CreationPanel />
            </MapContext.Provider>
          );

          // Stop map events from triggering through the panel
          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.disableScrollPropagation(container);

          return container;
        },
      });

      var control = new L.Control.Panel();
      control.addTo(mapRef.current);
      var creationControl = new L.Control.Creationpanel();
      creationControl.addTo(mapRef.current);

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
