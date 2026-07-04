import { useState, useEffect, useMemo } from "react";
import Button from "../common/Buttons";
import ParticipantsManager from "../collaboration/ParticipantsManager";
import "./css/DocumentModal.css";
import socket from "../../socket";

const DocumentModal = ({
  //document is the current opened Document for viewing/editing
  document,
  onClose,
  onEdit,
  onDelete,
  onShare,
  shareCode,
  copyToClipboard,
  setShowEditModal,
  onParticipantsUpdated,
  selectedDocument,
  setSelectedDocument,
}) => {
  const [localDocument, setLocalDocument] = useState(document);
  const [currentUserRole, setCurrentUserRole] = useState("reader");

  // 🔹 Read current user from localStorage
  let rawUser = null;
  try {
    rawUser = localStorage.getItem("user");
  } catch (e) {
    rawUser = null;
  }
  const currentUser = rawUser ? JSON.parse(rawUser) : null;
  const currentUserId = currentUser?.id || currentUser?._id;

  // 🔹 Determine owner
  const ownerId = document?.user?._id || document?.user;
  const isOwner =
    ownerId && currentUserId && ownerId.toString() === currentUserId.toString();

  // 🔹 Compute role from current state
  const computeUserRole = (documentData) => {
    if (!documentData) return "reader";
    if (isOwner) return "owner";

    //Check user into collaborators list
    const collab = (documentData?.collaborators || []).find((c) => {
      const id = c._id || c.user?._id || c.user;
      return id && currentUserId && id.toString() === currentUserId.toString();
    });

    //Extract role from collaborator entry
    return collab ? collab.role || "editor" : "reader";
  };


  // 🔹 Update role whenever document changes
  useEffect(() => {
    setCurrentUserRole(computeUserRole(document));
  }, [document, currentUserId, isOwner]);



  // 🔹 Permissions
  const canEdit = currentUserRole === "owner" || currentUserRole === "editor";
  const canManageParticipants = isOwner;
  const canDelete = isOwner;
  const canShare = isOwner;

  // 🔹 Handle edit

  //ultimately call handledEdit in DocsBoard.js
  const handleEditClick = () => {
    if (!canEdit) return alert("You don't have permission to edit this document.");
    onEdit(localDocument);
    onClose();
    setShowEditModal(true);
  };

  // 🔹 Handle delete

  //ultimately call handledDelete in DocsBoard.js
  const handleDeleteClick = () => {
    if (!canDelete) return alert("Only the owner can delete this document.");
    if (window.confirm("Delete this document?")) {
      onDelete(localDocument._id);
      onClose();
    }
  };

  // 🔹 Handle share

  //ultimately call handledShare in DocsBoard.js
  const handleShareClick = () => {
    if (!canShare) return alert("Only the owner can share this document.");
    onShare(localDocument._id);
  };


//All Methods is use in participants manager component

  // 🔹 Handle current user removed

  //If current user is removed by owner from participant list
  //Close the modal and clear localDocument
  const handleCurrentUserRemoved = () => {
    setLocalDocument(null);
    onClose();
  };

  // 🔹 Handle participants change
  const handleParticipantsChange = (updatedParticipants) => {
    setLocalDocument((prev) => ({ ...prev, collaborators: updatedParticipants }));
    setCurrentUserRole(computeUserRole({ ...localDocument, collaborators: updatedParticipants }));
    if (onParticipantsUpdated) onParticipantsUpdated(updatedParticipants);
  };

  // 🔹 Keep localDocument synced with parent
  useEffect(() => {
    setLocalDocument(document);
  }, [document]);

  
  
  
  
  
  
  
  // 🔹 Socket.IO real-time updates

  //When Rendering happen Then we can join room 
  useEffect(() => {
    if (!document?._id) return;

    // Join the document room
    socket.emit("joinDocument", document._id);

    // Handle document content updates

    //Call By Document Controller when document is updated
    const handleDocumentUpdated = (updatedDocument) => {
      if (updatedDocument._id === document._id) {

        //Display updated document data
        setLocalDocument(updatedDocument);

        //Update current user role
        setCurrentUserRole(computeUserRole(updatedDocument));

        //Notify parent about participants update

        // onParticipantsUpdated=> fetchDocuments in DocsBoard.js

        //check if onParticipantsUpdated is passed from parent
        if (onParticipantsUpdated) {
          //Notify parent about updated participants list
          onParticipantsUpdated(updatedDocument.collaborators || []);
        }

        //selectedDocument = updatedDocument
        if (selectedDocument?._id === updatedDocument._id) {
          setSelectedDocument(updatedDocument);
        }
      }
    };

    // Handle document deletion
    const handleDocumentDeleted = (deletedDocumentId) => {
      if (deletedDocumentId === document._id) {
        setLocalDocument(null);
        onClose();
      }
      if (selectedDocument?._id === deletedDocumentId) {
        setSelectedDocument(null);
      }
    };

    // Handle participant changes (role updates)
    const handleParticipantsChanged = ({ documentId, collaborators }) => {
      if (documentId === document._id) {
        setLocalDocument((prev) => ({ ...prev, collaborators }));
        setCurrentUserRole(computeUserRole({ ...localDocument, collaborators }));
        if (onParticipantsUpdated) onParticipantsUpdated(collaborators);
      }
      if (selectedDocument?._id === documentId) {
        setSelectedDocument((prev) => ({ ...(prev || {}), collaborators }));
      }
    };

    // Handle participant joined
    const handleParticipantJoined = (payload) => {
      if (!payload) return;
      const nid = payload.documentId || payload._id;
      if (nid === document._id || nid === document._id.toString()) {
        setLocalDocument((prev) => ({
          ...(prev || {}),
          collaborators: payload.collaborators || prev?.collaborators || [],
        }));
        setCurrentUserRole(
          computeUserRole({
            ...localDocument,
            collaborators: payload.collaborators || [],
          })
        );
        if (onParticipantsUpdated)
          onParticipantsUpdated(payload.collaborators || []);
      }
    };

    // Handle sharing event
    const handleDocumentShared = (sharedDocument) => {
      if (sharedDocument._id === document._id) {
        setLocalDocument(sharedDocument);
        setCurrentUserRole(computeUserRole(sharedDocument));
        if (selectedDocument?._id === sharedDocument._id) {
          setSelectedDocument(sharedDocument);
        }
      }
    };

    // Handle real-time content changes from typing (receive-changes)
    const handleReceiveChanges = (payload) => {
      if (!payload) return;
      const { documentId, content: newContent } = payload;
      if (documentId === document._id || documentId === document._id.toString()) {
        setLocalDocument((prev) => ({ ...prev, content: newContent }));
      }
    };

    // Register listeners
    socket.on("documentUpdated", handleDocumentUpdated);
    socket.on("documentDeleted", handleDocumentDeleted);
    socket.on("participantsChanged", handleParticipantsChanged);
    socket.on("participantJoined", handleParticipantJoined);
    socket.on("documentShared", handleDocumentShared);
    socket.on("receive-changes", handleReceiveChanges);

    // Cleanup listeners
    return () => {
      socket.off("documentUpdated", handleDocumentUpdated);
      socket.off("documentDeleted", handleDocumentDeleted);
      socket.off("participantsChanged", handleParticipantsChanged);
      socket.off("participantJoined", handleParticipantJoined);
      socket.off("documentShared", handleDocumentShared);
      socket.off("receive-changes", handleReceiveChanges);

      // Leave the document room
      socket.emit("leaveDocument", document._id);
    };
  }, [document?._id, onClose, onParticipantsUpdated, selectedDocument, setSelectedDocument]);






  if (!localDocument) return null;

  return (
    <div className="document-modal-overlay" onClick={onClose}>
      <div
        className="document-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header - Google Docs style */}
        <div className="document-modal-header">
          <div className="document-modal-header-left">
            <h2 className="document-title">{localDocument.title}</h2>
            <span
              className={`document-badge ${
                localDocument.isShared ? "shared" : "private"
              }`}
            >
              {localDocument.isShared ? "🔗 Shared" : "🔒 Private"}
            </span>
          </div>
          <div className="document-actions">
            {canShare && (
              <Button
                text="Share"
                //Ultimately call handledShare in DocsBoard.js
                onClick={handleShareClick}
                style={{
                  backgroundColor: "#1a73e8",
                  color: "white",
                  padding: "8px 24px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              />
            )}
            <button
              onClick={onClose}
              className="document-modal-close"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>


        {/* Footer - Action buttons */}
        <div className="document-modal-footer">
          <div className="document-actions">
            <Button
              text={canEdit ? "Edit" : "View Only"}
              //Ultimately call handledEdit in DocsBoard.js
              onClick={handleEditClick}
              style={{
                backgroundColor: canEdit ? "#1a73e8" : "#9aa0a6",
                color: "white",
                padding: "8px 16px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: canEdit ? "pointer" : "not-allowed",
              }}
            />

            {canDelete && (
              <Button
                text="Delete"
                //Ultimately call handledDelete in DocsBoard.js
                onClick={handleDeleteClick}
                style={{
                  backgroundColor: "#ea4335",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              />
            )}
          </div>

          {shareCode && (
            <div className="document-share">
              <span>Share Code: {shareCode}</span>
              <Button
                text="Copy"
                //Ultimately call copyToClipboard function passed from DocsBoard.js
                onClick={() => copyToClipboard(shareCode)}
                style={{
                  backgroundColor: "#1a73e8",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              />
            </div>
          )}
        </div>

        {/* Section - As document subtitle */}
        <h4 className="document-section">{localDocument.section || "No Section"}</h4>

        {/* Main content area - Google Docs paper style */}
        <div className="document-modal-body">

          {/* Keywords */}
          {localDocument.keywords?.length > 0 && (
            <div className="document-keywords-section">
              <h4>Keywords</h4>
              <div className="document-keywords">
                {localDocument.keywords.map((keyword, idx) => (
                  <span key={idx} className="document-keyword">
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Participants */}
          {localDocument.isShared && (
            <div className="document-participants">
              <h4>Participants</h4>
              {localDocument.user && (
                <div className="document-owner">
                  <strong>👑 Owner:</strong>{" "}
                  {localDocument.user.email || "Unknown"}
                </div>
              )}
              <ParticipantsManager
                documentId={localDocument._id}
                currentUserId={currentUserId}
                isOwner={canManageParticipants}
                owner={localDocument.user}
                participants={localDocument.collaborators}
                onParticipantsChange={handleParticipantsChange}
                onCurrentUserRemoved={handleCurrentUserRemoved}
              />
            </div>
          )}
        </div>

        {/* Metadata - Google Docs style info panel */}
        <div className="document-meta">
          <p className="meta-line">
            <span>Created: </span>
            {new Date(localDocument.createdAt).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {localDocument.updatedAt && (
            <p className="meta-line">
              <span>Last Modified: </span>
              {new Date(localDocument.updatedAt).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          {localDocument.modifiedBy && (
            <p className="meta-line">
              <span>Modified By: </span>
              {localDocument.modifiedBy?.email || "Unknown"}
            </p>
          )}
        </div>

        

        <div class="document-modal-content">
          <h4 class="content-header">Content</h4>
          <div className="document-content">{localDocument.content}</div>
        </div>

      </div>
    </div>
  );
};

export default DocumentModal;