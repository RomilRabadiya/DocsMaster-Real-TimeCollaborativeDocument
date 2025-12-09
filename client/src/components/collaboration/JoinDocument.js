import React from "react";
import InputField from "../common/InputFields";
import Button from "../common/Buttons";
import "./css/JoinDocument.css";

const JoinDocument = ({
  shareCodeInput,
  setShareCodeInput,
  handleJoinDocument,
  sharedDocumentPreview,
}) => {
  return (
    <div className="join-document">
      {/* Heading */}
      <h2 className="join-document-title">Join a Shared Document</h2>

      {/* Input + Button */}
      <div className="join-document-controls">
        <InputField
          type="text"
          value={shareCodeInput}
          onChange={(e) => setShareCodeInput(e.target.value)}
          placeholder="Enter share code"
        />
        <Button
          text="Join Document"
          onClick={handleJoinDocument}
          style={{ backgroundColor: "purple" }}
        />
      </div>

      {/* Shared Document Preview 
              This Preview Will display For only 
      */}
      {sharedDocumentPreview && (
        <div className="join-document-preview">
          <h3>Preview Shared Document (auto-adding...)</h3>
          <p>
            <b>Title:</b> {sharedDocumentPreview.title}
          </p>
          <p>
            <b>Content:</b> {sharedDocumentPreview.content}
          </p>
          <p>
            <b>Keywords:</b> {sharedDocumentPreview.keywords ? sharedDocumentPreview.keywords.join(", ") : "No keywords"}
          </p>
        </div>
      )}
    </div>
  );
};

export default JoinDocument;