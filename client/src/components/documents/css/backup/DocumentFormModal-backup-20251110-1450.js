import React from "react";
import InputField from "../common/InputFields";
import Button from "../common/Buttons";
import "./css/DocumentFormModal.css";

const DocumentFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  title,
  setTitle,
  content,
  setContent,
  section,
  setSection,
  handleContentChange,
  keywordInput,
  setKeywordInput,
  keywords,
  addKeyword,
  removeKeyword,
  handleUndo,
  handleRedo,
  historyIndex,
  history,
}) => {
  if (!isOpen) return null;

  return (
    <div className="document-modal-overlay" onClick={onClose}>
      <div
        className="document-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="document-modal-header">
          <h2>{mode === "edit" ? "Edit Document" : "Create Document"}</h2>
          <button className="document-modal-close" onClick={onClose}>
            ✖
          </button>
        </div>

        {/* Content */}
        <div className="document-modal-content">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(e);
            }}
          >
            {/* Title */}
            <div className="document-form-group">
              <label className="document-modal-label">Title</label>
              <InputField
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title..."
              />
            </div>

            {/* Section */}
            <div className="document-form-group">
              <label className="document-modal-label">Section</label>
              <InputField
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Enter section..."
              />
            </div>

            {/* Content */}
            <div className="document-form-group">
              <label className="document-modal-label">Content</label>
              <textarea
                rows="8"
                value={content}
                onChange={handleContentChange}
                placeholder="Write your document..."
                className="document-modal-textarea"
              />
            </div>

            {/* Undo/Redo */}
            <div className="document-history-actions">
              <Button
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="document-undo"
                style={{
                  backgroundColor:
                    historyIndex === 0 ? "#d1d5db" : "#6b7280",
                }}
              >
                ↶ Undo
              </Button>
              <Button
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
                className="document-redo"
                style={{
                  backgroundColor:
                    historyIndex === history.length - 1
                      ? "#d1d5db"
                      : "#6b7280",
                }}
              >
                ↷ Redo
              </Button>
            </div>

            {/* Keywords */}
            <div className="document-keywords-container">
              <label className="document-modal-label">Keywords</label>
              <div className="document-keyword-input-row">
                <InputField
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Enter a keyword"
                />
                <Button
                  text="Add Keyword"
                  onClick={addKeyword}
                  type="button"
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    border: "none",
                    fontWeight: "500",
                  }}
                />
              </div>

              <div className="document-keyword-list">
                {keywords.map((keyword, index) => (
                  <span key={index} className="document-keyword">
                    #{keyword}
                    <button onClick={() => removeKeyword(keyword)} type="button">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="document-form-actions">
              <Button
                text="Cancel"
                onClick={onClose}
                type="button"
                style={{
                  backgroundColor: "#6b7280",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                }}
              />
              <Button
                text={mode === "edit" ? "Update Document" : "Create Document"}
                type="submit"
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                }}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentFormModal;