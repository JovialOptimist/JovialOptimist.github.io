import React from 'react';

/**
 * Leaflet map component
 */
const MapView: React.FC = () => {
  return (
    <div className="map-container">
      {/* Leaflet map will be initialized here */}
      <div id="map"></div>
    </div>
  );
};

export default MapView;