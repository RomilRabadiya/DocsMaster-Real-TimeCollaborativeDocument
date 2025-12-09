import React, { useState } from "react";
import "./css/SortFilter.css";

const SortFilter = ({ sortOption, setSortOption, sortOrder, setSortOrder }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      {isFocused && <div className="overlay"></div>}

      <div className={`sort-filter-container ${isFocused ? "active" : ""}`}>
        <label className="sort-filter-label">
          <p className="sort-filter-default">
            Recent Selected on reload or default
          </p>
          Sort by:
        </label>

        <div className="sort-filter-wrapper">
          {/* Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className={`sort-filter-select ${isFocused ? "enlarged" : ""}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <option value="recent">Recently Selected</option>
            <option value="title">Title (A → Z)</option>
            <option value="createdAt">Creation Time</option>
            <option value="updatedAt">Update Time</option>
          </select>

          {/* ASC / DESC buttons (linked to dropdown) */}
          <div className="sort-order-buttons">
            <button
              type="button"
              className={`order-btn ${sortOrder === "asc" ? "active" : ""}`}
              onClick={() => setSortOrder("asc")}
            >
              ASC
            </button>
            <button
              type="button"
              className={`order-btn ${sortOrder === "desc" ? "active" : ""}`}
              onClick={() => setSortOrder("desc")}
            >
              DESC
            </button>
          </div>

          {/* Close */}
          {isFocused && (
            <button
              className="close-btn"
              onClick={() => setIsFocused(false)}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SortFilter;