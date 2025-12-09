import React from "react";
import "./css/CreateDocumentButton.css"; // import CSS file

const CreateDocumentButton = ({ onClick }) => {
  return (
    <div className="create-document-card" onClick={onClick}>
      <div className="create-document-content">
        {/* Title */}
        <h3 className="create-document-title">Create New Document</h3>

        {/* Subtitle */}
        <p className="create-document-subtitle">
          Start organizing your thoughts, tasks, and ideas in a clean new document.
        </p>

        {/* CTA Button */}
        <span className="create-document-cta">➕ Add Document</span>
      </div>
    </div>
  );
};

export default CreateDocumentButton;