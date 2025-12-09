import React, { useEffect, useRef } from "react";
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
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const textareaRef = useRef(null);
  const pageContainerRef = useRef(null);
  
  // Define page character limit (estimated based on page size)
  const CHARACTERS_PER_PAGE = 2000;
  
  // Calculate total pages based on content length
  useEffect(() => {
    const calculatedPages = Math.max(1, Math.ceil(content.length / CHARACTERS_PER_PAGE));
    if (calculatedPages !== totalPages) {
      setTotalPages(calculatedPages);
      // Adjust current page if it exceeds the new total pages
      if (currentPage > calculatedPages) {
        setCurrentPage(calculatedPages);
      }
    }
  }, [content, currentPage, totalPages]);
  
  // Get content for current page
  const getCurrentPageContent = () => {
    const startIndex = (currentPage - 1) * CHARACTERS_PER_PAGE;
    const endIndex = Math.min(startIndex + CHARACTERS_PER_PAGE, content.length);
    return content.substring(startIndex, endIndex);
  };
  
  // Update content for current page only
  const handlePageContentChange = (e) => {
    const startIndex = (currentPage - 1) * CHARACTERS_PER_PAGE;
    const endIndex = Math.min(startIndex + CHARACTERS_PER_PAGE, content.length);
    const beforePage = content.substring(0, startIndex);
    const afterPage = content.substring(endIndex);
    const newFullContent = beforePage + e.target.value + afterPage;
    
    setContent(newFullContent);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };
  
  // Navigate to specific page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (textareaRef.current) {
        // Update textarea content to match the page being navigated to
        textareaRef.current.value = getCurrentPageContent();
        // Reset textarea height
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  // Navigate to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };
  
  // Navigate to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };
  
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
                <div className="content-header-controls">
                  <div className="page-navigation">
                    <button
                      className="page-nav-button prev-button"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      title="Previous page (Ctrl+Shift+←)"
                    >
                      ◀
                    </button>
                    <div className="page-info">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button
                      className="page-nav-button next-button"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      title="Next page (Ctrl+Shift+→)"
                    >
                      ▶
                    </button>
                  </div>
                  <div className="character-count">
                    {content.length} characters
                  </div>
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
                      ref={textareaRef}
                      value={getCurrentPageContent()}
                      onChange={handlePageContentChange}
                      placeholder="Start typing or insert your text here..."
                      className="document-modal-textarea google-docs-style"
                      style={{
                        height: 'auto',
                        overflow: 'hidden',
                        resize: 'none'
                      }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                  </div>
                </div>

                {/* <div className="document-status-bar">
                  <div className="status-left">
                    <span id="page-counter">Page 1 of 1</span>
                    <span>Last saved: Just now</span>
                  </div>
                  <div className="status-right">
                    <span>Auto-saved</span>
                  </div>
                </div> */}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentFormModal;