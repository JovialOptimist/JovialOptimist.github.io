import React from "react";

/**
 * Panel for text search functionality
 */
const TextSearchPanel: React.FC = () => {
  return (
    <div className="panel text-search-panel">
      <h2>Text Search</h2>
      {/* Text search controls and results will go here */}
      <input
        type="text"
        placeholder="Search for text..."
        className="search-input"
      />
      <button className="search-button">Search</button>
    </div>
  );
};

export default TextSearchPanel;
