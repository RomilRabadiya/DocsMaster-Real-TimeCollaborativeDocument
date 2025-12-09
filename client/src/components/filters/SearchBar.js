import React from "react";
import "./css/SearchBar.css"; // Import external CSS

// SearchBar component to filter documents by title

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="searchbar-container">
      <input
        type="text"
        placeholder="🔍 Search documents by title..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="searchbar-input"
      />
    </div>
  );
};

export default SearchBar;