import React from "react";
import { Link } from "react-router-dom";
import "./css/GoToDocsBoardButton.css";

const GoToDocsBoardButton = () => {
  return (
    <Link to="/documents" className="documentsboard-link">
      <div className="documentsboard-card">
        <div className="documentsboard-content">
          <h3 className="documentsboard-title">Go to DocsBoard</h3>
          <p className="documentsboard-subtitle">
            View and manage all your documents in one place.
          </p>
          <span className="documentsboard-cta">➡ Go Now</span>
        </div>
      </div>
      </Link>
  );
};

export default GoToDocsBoardButton;