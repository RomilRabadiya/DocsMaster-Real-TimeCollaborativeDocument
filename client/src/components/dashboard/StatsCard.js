import React from "react";


// This component displays statistics about total documents and total keywords
const StatsCard = ({ totalDocuments, totalKeywords }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        backgroundColor: "#f9fafb",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        marginBottom: "20px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827" }}>
          📝 {totalDocuments}
        </h3>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>Total Documents</p>
      </div>

      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827" }}>
          🏷️ {totalKeywords}
        </h3>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>Total Keywords</p>
      </div>
    </div>
  );
};

export default StatsCard;