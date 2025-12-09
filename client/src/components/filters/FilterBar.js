import React from "react";
import "./css/FilterBar.css";

// FilterBar component to filter documents by section and keywords
//component Only Display Select Dropdown for Section and Keywords
const FilterBar = ({ sections, keywords, selectedSection, setSelectedSection, selectedKeyword, setSelectedKeyword }) => {
  return (
    <div className="filterbar-container">
      {/* Section Filter */}
      <select
        value={selectedSection}
        //change the selected section when user selects a different option
        onChange={(e) => setSelectedSection(e.target.value)}
        className="filter-select"
      >
        <option value="">All Sections</option>
        {sections.map((subj, idx) => (
          <option key={idx} value={subj}>
            {subj}
          </option>
        ))}
      </select>

      {/* Keyword Filter */}
      <select
        value={selectedKeyword}
        //change the selected keyword when user selects a different option
        onChange={(e) => setSelectedKeyword(e.target.value)}
        className="filter-select"
      >
        <option value="">All Keywords</option>
        {keywords.map((keyword, idx) => (
          <option key={idx} value={keyword}>
            {keyword}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;