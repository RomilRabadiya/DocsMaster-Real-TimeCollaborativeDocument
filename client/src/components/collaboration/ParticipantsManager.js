import React, { useState, useEffect } from "react";
import Button from "../common/Buttons";
import "./css/ParticipantsManager.css";
import {
  changeParticipantRole,
  removeParticipant,
  shareDocumentByEmail,
} from "../../api/docsApis";
import socket from "../../socket";

const ParticipantsManager = ({
  documentId,// current document ID
  currentUserId,// current logged-in user ID
  isOwner,// is current user the owner
  participants = [],// array of participant objects
  owner,// owner object
  refreshDocument,// parent callback when document is updated
  onCurrentUserRemoved,//=>handleCurrentUserRemoved Method of DocumentModel.js
}) => {
  const [localParticipants, setLocalParticipants] = useState(participants || []);

  // State for invite email input
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => setLocalParticipants(
    participants || []
  ), [participants]);


  
  // Join document room and listen for updates
  //when documentId changes,refreshDocument changes,currentUserId changes,onCurrentUserRemoved(Remove user by owner) changes
  useEffect(() => {
    if (!documentId) return;

    
    // Handle incoming document updates
    //feature: if current user is removed by owner, notify parent
    const handleDocumentUpdate = (updatedDocument) =>
    {
      if (updatedDocument._id !== documentId) return;
      
      // Update local participants list
      setLocalParticipants(updatedDocument.collaborators || []);

      // Check if current user is still a participant
      const isStillParticipant =
        updatedDocument.user?._id === currentUserId ||
        updatedDocument.user === currentUserId ||
        updatedDocument.collaborators?.some(p => (p.user?._id || p.user || p._id) === currentUserId);
      
      // If current user was removed, notify parent

      //(Remove user by owner)
      if (!isStillParticipant && onCurrentUserRemoved) {
        //This is ultimately closed Document Model
        onCurrentUserRemoved();
      }


      if (refreshDocument) refreshDocument();
    };

    // Set up socket listeners
    socket.on("documentUpdated", handleDocumentUpdate);

    // Join the document room
    if (socket.connected) socket.emit("joinDocument", documentId);

    return () => {
      socket.emit("leaveDocument", documentId);
      socket.off("documentUpdated", handleDocumentUpdate);
    };

  },[documentId, refreshDocument, currentUserId, onCurrentUserRemoved]);





  // Change participant role
  const handleRoleChange = async (userId, role) => {
    if (!isOwner) return;
    const original = localParticipants;
    try
    {
      //this functional form ensures we always have the latest state
      setLocalParticipants(prev =>
        prev.map(p => (p.user?._id || p.user || p._id) === userId ? { ...p, role } : p)
      );

      //call api
      await changeParticipantRole(documentId, userId, role);
    }
    //on error, revert UI
    catch (err) {
      setLocalParticipants(original);
      alert("Failed to change role: " + (err.response?.data?.message || err.message));
    }
  };

  // Remove participant
  const handleRemove = async (userId) => {
    if (!isOwner || !window.confirm("Remove this participant?")) return;
    const original = localParticipants;
    try
    {
      setLocalParticipants(prev => prev.filter(p => (p.user?._id || p.user || p._id) !== userId));
      //call api
      await removeParticipant(documentId, userId);
    }
    //on error, revert UI
    catch (err) {
      setLocalParticipants(original);
      alert("Failed to remove participant: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="participants-manager">
      {isOwner && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Invite by email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ flex: 1, padding: 6 }}
          />
          <Button
            text="Invite"
            onClick={async () => {
              if (!inviteEmail) return;
              try {

                //call api to share document by email
                await shareDocumentByEmail(documentId, inviteEmail);
                alert("Invitation sent");
                setInviteEmail("");
              } catch (err) {
                alert("Failed: " + (err.response?.data?.message || err.message));
              }
            }}
            style={{ backgroundColor: "#3b82f6", color: "white", padding: "4px 12px", borderRadius: 6 }}
          />
        </div>
      )}
      <div className="participant-list">
        {/*Qwner is passed by parent */}
        {owner && (
          <div key={owner._id} className="participant owner">
            <span className="participant-label">
              👑 {owner.email || owner.name} (Owner)
            </span>
          </div>
        )}

        {/*Extract All participants */}
        {localParticipants.map((p) => {

          //Store field values
          const userId = p.user?._id || p.user || p._id;
          const email = p.user?.email || p.email || "Unknown";
          const role = p.role || "reader";

          return (
            <div key={userId} className="participant">
              <span className="participant-label">
                👤 {email} <span className={`role-badge ${role}`}>{role}</span>
              </span>

              {/*User is owner Then User can remove Participant and Change Role of Participant */}
              {isOwner && userId !== currentUserId && (
                <div className="participant-actions">
                  <Button
                    text={role === "editor" ? "Make Reader" : "Make Editor"}
                    //Pass userId and role to handleRoleChange, Ultimately call changeParticipantRole api function
                    onClick={() => handleRoleChange(userId, role === "editor" ? "reader" : "editor")}
                    style={{
                      backgroundColor: role === "editor" ? "#10b981" : "#3b82f6",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      marginRight: "6px",
                    }}
                  />
                  <Button
                    text="Delete"
                    //Pass userId to handleRemove, Ultimately call removeParticipant api function
                    onClick={() => handleRemove(userId)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantsManager;