// src/components/map/MapView.tsx
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapStore } from "../../state/mapStore";
import React from "react";

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null); // Ref to the map container
  const mapInstanceRef = useRef<L.Map | null>(null); // Store Leaflet map instance
  const geojsonAreas = useMapStore((state) => state.geojsonAreas);

  useEffect(() => {
    // Prevent reinitialization
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false, // disable default position of zoom control
      }).setView([47.615, -122.035], 13);

      // Add back the zoom control to the bottom right
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(map);

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

  // Reference to store our GeoJSON layer group for better management
  const geoJSONLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Handle GeoJSON data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove any existing GeoJSON layer group
    if (geoJSONLayerGroupRef.current) {
      geoJSONLayerGroupRef.current.clearLayers();
      map.removeLayer(geoJSONLayerGroupRef.current);
    }

    // Create a new layer group to hold all GeoJSON features
    const layerGroup = L.layerGroup().addTo(map);
    geoJSONLayerGroupRef.current = layerGroup;

    // Mark the layer group for future cleanup
    (layerGroup as any)._isGeoJSON = true;

    if (geojsonAreas.length === 0) return;

    // Create a bounds object to fit all features
    let bounds = new L.LatLngBounds([]);

    // Add each GeoJSON feature to the layer group
    geojsonAreas.forEach((feature) => {
      const layer = L.geoJSON(feature, {
        style: {
          color: "blue",
          weight: 2,
          fillOpacity: 0.4,
        },
      }).addTo(layerGroup);

      // Make draggable

      // Set bounds to the feature's bounds
      try {
        bounds = layer.getBounds();
      } catch (error) {
        console.warn("Could not get bounds for a feature:", error);
      }
    });

    // If we have valid bounds, fit the map to them
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [geojsonAreas]);

  return (
    <div className="map-container">
      <div id="map" ref={mapRef}></div>
    </div>
  );
}
