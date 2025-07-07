// src/components/Map/MapPolygonLayer.tsx
import React, { useEffect } from "react";
import L from "leaflet";

declare global {
  interface Window {
    leafletMap: L.Map;
  }
}

interface MapPolygonLayerProps {
  polygons: {
    id: string;
    geojson: GeoJSON.Polygon | GeoJSON.MultiPolygon;
    color: string;
  }[];
}

export const MapPolygonLayer: React.FC<MapPolygonLayerProps> = ({
  polygons,
}) => {
  useEffect(() => {
    const layerGroup = L.layerGroup();

    polygons.forEach(({ geojson, color }) => {
      L.geoJSON(geojson, {
        style: { color, weight: 2, fillOpacity: 0.4 },
      }).addTo(layerGroup);
    });

    layerGroup.addTo(window.leafletMap);

    return () => {
      layerGroup.clearLayers();
      layerGroup.remove();
    };
  }, [polygons]);

  return null;
};
