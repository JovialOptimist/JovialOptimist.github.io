// src/components/panels/TextSearchPanel.tsx

import React, { useState } from "react";
import { useMapStore } from "../../state/mapStore";

export default function TextSearchPanel() {
  const [query, setQuery] = useState("");
  const addGeoJSONFromSearch = useMapStore(
    (state) => state.addGeoJSONFromSearch
  );

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=geojson&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();

      if (data.features?.length > 0) {
        addGeoJSONFromSearch(data.features[0]); // Add first result
      } else {
        alert("No results found.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("There was a problem searching.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="panel">
      <h2>Text Search</h2>
      <input
        type="text"
        value={query}
        placeholder="Search for a place"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-search-input"
      />
      <button onClick={handleSearch} className="text-search-button">
        Search
      </button>
    </div>
  );
}
