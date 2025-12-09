import React, { useState } from "react";
import "./css/DocumentCard.css";
import ShareByEmail from "../ShareByEmail";
import { shareDocument } from "../../api/docsApis";

const DocumentCard = ({
  document,
  onClick,
}) => {
  //State to show/hide share by email modal
  const [showShareEmail, setShowShareEmail] = useState(false);
  //Store generated share code
  const [generatedShareCode, setGeneratedShareCode] = useState("");

  // Function to generate share code
  const handleGenerateShareCode = async (e) => {
    e.stopPropagation();
    try {

      //call shareDocument api to generate share code
      const response = await shareDocument(document._id);

      //Display generated share code
      setGeneratedShareCode(response.data.shareCode);
      alert(`Share code generated: ${response.data.shareCode}`);
    } catch (error) {
      alert("Error generating share code");
    }
  };

  // Function to copy share code to clipboard

  //When user copy button click
  //Code copy to clipboard
  const handleCopyShareCode = (e) => {
    e.stopPropagation();
    if (generatedShareCode) {
      navigator.clipboard.writeText(generatedShareCode);
      alert("Share code copied to clipboard!");
    }
  };

  //e.stopPropagation() is used to prevent the click event from bubbling up to parent elements.
  //"Only this element should handle the click — don't let the click go to the parent."

  return (
    <div className="document-card" onClick={() => onClick(document)}>
      {/* Title + Shared Keyword */}
      <div className="document-header">
        <h3 className="document-title">{document.title}</h3>
        <span className="document-status">
          {document.isShared ? "🔗 Shared" : "🔒 Private"}
        </span>
      </div>

      {/* Section */}
      <div className="document-section-wrapper">
        <span className="document-section">
          📘 {document.section || "No Section"}
        </span>
      </div>

      {/* Keywords */}
      <div className="document-keywords">
        {(document.keywords && document.keywords.length > 0) ? (
          document.keywords.map((keyword, index) => (
            <span key={index} className="document-keyword">
              #{keyword}
            </span>
          ))
        ) : (
          <span className="document-no-keywords">No keywords</span>
        )}
      </div>


      {/* Share Actions */}
      <div className="document-share-actions">
        <button className="share-button" onClick={handleGenerateShareCode}>
          🔗 Generate Share Code
        </button>
        {generatedShareCode && (
          <div className="share-code-container">
            <span className="share-code">{generatedShareCode}</span>
            <button className="copy-button" onClick={handleCopyShareCode}>
              📋 Copy
            </button>
          </div>
        )}
        {/* Click On this button to open share by email modal*/}
        <button className="share-email-button" onClick={(e) => { e.stopPropagation(); setShowShareEmail(true); }}>
          📧 Share by Email
        </button>
      </div>

      {/* Share by Email Modal */}
      {showShareEmail && (
        <div className="share-email-modal" onClick={(e) => { e.stopPropagation(); setShowShareEmail(false); }}>
          <div className="share-email-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setShowShareEmail(false)}>×</span>
            <ShareByEmail documentId={document._id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
