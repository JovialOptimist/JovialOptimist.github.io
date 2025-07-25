// src/components/map/MapView.tsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null); // Ref to the map container
  const mapInstanceRef = useRef<L.Map | null>(null); // Store Leaflet map instance

  useEffect(() => {
    // Prevent reinitialization
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([47.615, -122.035], 13);

      // Add a basic tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
      }).addTo(map);

      // Store map instance so we can clean up later
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove(); // Clean up Leaflet map
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-container">
      <div id="map" ref={mapRef}></div>
    </div>
  );
}
