import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../layouts/css/DocsLayout.css";

export default function DocsLayout({ children }) {
  const location = useLocation();
  
  return (
    <div className="docs-layout">
      <aside className="docs-sidebar">
        <div className="docs-sidebar-header">
          <h2 className="docs-logo">🧾 DocsMaster</h2>
        </div>
        <nav className="docs-nav">
          <Link 
            to="/documents" 
            className={`docs-nav-item ${location.pathname === "/documents" ? "active" : ""}`}
          >
            📂 My Documents
          </Link>
          <Link 
            to="/shared" 
            className={`docs-nav-item ${location.pathname === "/shared" ? "active" : ""}`}
          >
            👥 Shared
          </Link>
        </nav>
      </aside>

      <main className="docs-main">
        {children}
      </main>
    </div>
  );
}