import React, { useEffect, useRef } from "react";
import Button from "../common/Buttons";
import "./css/DocumentFormModal.css";

const DocumentFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  //Passing mode prop to differentiate between create and edit
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
  socket,
  documentId,
}) => {

  // Pagination State and Refs

  const [currentPage, setCurrentPage] = React.useState(1);
  //total page mean how many pages are there based on content length
  const [totalPages, setTotalPages] = React.useState(1);

  // useRef is Use To access DOM element directly
  // textareaRef → you can manipulate the text area
  const textareaRef = useRef(null);
  
  // Define page character limit (estimated based on page size)
  const CHARACTERS_PER_PAGE = 2000;


  
  //When Content Change => Calculate total pages based on content length
  useEffect(() => {
    //page calculation logic
    const calculatedPages = Math.max(1, Math.ceil(content.length / CHARACTERS_PER_PAGE));


    if (calculatedPages !== totalPages)
    {
      setTotalPages(calculatedPages);
      //currentPage > calculatedPages Logic is important when user delete content
      if (currentPage > calculatedPages)
      {
        setCurrentPage(calculatedPages);
      }
    }
  }, [content, currentPage, totalPages]);//depend on content change only
  

  // Get content for current page

  useEffect(() => {
    if (isOpen && mode === "edit" && socket && documentId) {
      // Delay to prevent race condition with DocumentModal's cleanup leaveDocument
      const timer = setTimeout(() => {
        socket.emit("joinDocument", documentId);
      }, 200);
      
      return () => {
        clearTimeout(timer);
        socket.emit("leaveDocument", documentId);
      };
    }
  }, [isOpen, mode, socket, documentId]);

  // Extract content for the current page Logic : 
              // For Example If currentPage=2 And CHARACTERS_PER_PAGE=2000
              // Then startIndex=2000 and endIndex=4000
  const getCurrentPageContent = () => {
    const startIndex = (currentPage - 1) * CHARACTERS_PER_PAGE;
    const endIndex = Math.min(startIndex + CHARACTERS_PER_PAGE, content.length);
    return content.substring(startIndex, endIndex);
  };
  

  // Update content for current page only
  //When we remove or add content in current page only that time this function call
  const handlePageContentChange = (e) => {
    const startIndex = (currentPage - 1) * CHARACTERS_PER_PAGE;
    // Calculate end index for current page
    const endIndex = Math.min(startIndex + CHARACTERS_PER_PAGE, content.length);

    const beforePage = content.substring(0, startIndex);

    const afterPage = content.substring(endIndex,content.length);//Correct this line to endIndex to total content length
    const newFullContent = beforePage + e.target.value + afterPage;
    
    setContent(newFullContent);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    
    // Live update emission
    if (mode === "edit" && socket && documentId) {
      socket.emit("send-changes", { documentId, content: newFullContent });
    }
  };
  
  // Navigate to specific page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages)
    {
      setCurrentPage(page);
      if (textareaRef.current)
      {
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

            {/*Save or Create Button based on mode*/}
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

        {/*Model Form For Creation And Deletion And Form Contain All field of Document model*/}
        <div className="document-modal-content">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(e);//ultimately call handleSubmit in dashboard.js
            }}
          >
            {/* Title */}
            <div className="document-form-group full-width">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}//ultimately call setTitle in dashboard.js
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
                    onChange={(e) => setSection(e.target.value)}//ultimately call setSection in dashboard.js
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
                        /*Set keyword input state in dashboard.js*/
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
                        /*When Click Add keyword to keywords array in dashboard.js*/
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
                            /*Remove keyword from keywords array in dashboard.js*/
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

                      //goToPreviousPage Is method of DocumentFormModal.js For Navigate Previous Page
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
                      //goToNextPage Is method of DocumentFormModal.js For Navigate Next Page
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
                  /*Undo and Redo buttons*/
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
              
              {/* Text Editor Area */}
              <div className="text-editor-container">
                <div className="document-page-container">
                  <div className="document-page">
                    <textarea
                      ref={textareaRef}
                      value={getCurrentPageContent()}
                      /*handlePageContentChange()=>   When Content Change in textarea => According to Change Our content state variable set*/
                      /*useEffect will calculate total pages based on content length when content change*/
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
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentFormModal;