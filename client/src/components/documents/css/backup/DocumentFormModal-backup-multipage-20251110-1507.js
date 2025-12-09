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

        {/* Header with Action Buttons */}
        <div className="document-modal-header-actions">
          <div className="document-modal-actions">
            <Button
              text="Cancel"
              onClick={onClose}
              type="button"
              className="cancel-button"
            />
            <Button
              text={mode === "edit" ? "Save" : "Create"}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSubmit(e);
              }}
              className="submit-button"
            />
          </div>
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
            <div className="document-form-group full-width">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled document"
                className="document-title-input"
              />
            </div>

            {/* Document Metadata Section */}
            <div className="document-metadata-section">
              <div className="section-title">Document details</div>
              <div className="document-form-row">
                {/* Section */}
                <div className="document-form-group">
                  <label className="document-form-label">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. Marketing, Engineering"
                    className="document-section-input"
                  />
                </div>

                {/* Keywords */}
                <div className="document-keywords-inline">
                  <div className="document-form-group">
                    <label className="document-form-label">Keywords</label>
                    <div className="document-keyword-input-container">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="Add a keyword"
                        className="document-keyword-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addKeyword();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="add-keyword-button"
                        title="Add keyword"
                      >
                        +
                      </button>
                    </div>
                    <div className="document-keyword-tags">
                      {keywords.map((keyword, index) => (
                        <span key={index} className="document-keyword-tag">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="keyword-remove"
                            title="Remove keyword"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content - Google Docs Style */}
            <div className="document-content-area">
              <div className="content-section-header">
                <div className="section-title">Content</div>
                <div className="character-count">
                  {content.length} characters
                </div>
              </div>
              
              <div className="document-toolbar">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                  className="toolbar-button"
                  title="Undo (Ctrl+Z)"
                >
                  ↶
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex === history.length - 1}
                  className="toolbar-button"
                  title="Redo (Ctrl+Y)"
                >
                  ↷
                </button>
              </div>
              
              <div className="text-editor-container">
                <div className="document-page-container">
                  <div className="document-page">
                    <textarea
                      value={content}
                      onChange={handleContentChange}
                      placeholder="Start typing or insert your text here..."
                      className="document-modal-textarea google-docs-style"
                      style={{
                        height: 'auto',
                        overflow: 'hidden',
                        resize: 'none'
                      }}
                      onInput={(e) => {
                        // Auto-expand textarea height as user types
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                  </div>
                </div>

                <div className="document-status-bar">
                  <div className="status-left">
                    <span id="page-counter">Page 1 of 1</span>
                    <span>Last saved: Just now</span>
                  </div>
                  <div className="status-right">
                    <span>Auto-saved</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentFormModal;