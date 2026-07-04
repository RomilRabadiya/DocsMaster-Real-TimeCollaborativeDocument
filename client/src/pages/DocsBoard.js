//Only socket.io is define in if selected document is delete if in document board this code not for update all documents without selecting a document
//our next step is to make this work for all documents in the documents board


// src/pages/DocsBoard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NoteFormModal from "../components/documents/DocumentFormModal";
import NoteCard from "../components/documents/DocumentCard";
import NoteModal from "../components/documents/DocumentModal";
import Navbar from "../components/layout/Navbar";
import CreateNoteButton from "../components/documents/CreateDocumentButton";
import JoinNote from "../components/collaboration/JoinDocument";
import SortFilter from "../components/filters/SortFilter";
import SearchBar from "../components/filters/SearchBar";
import FilterBar from "../components/filters/FilterBar";

// Import all API functions from noteApis.js By using AXIOS
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  getSharedDocument,
  joinSharedDocument,
  updateSelectionTime,
} from '../api/docsApis';

import socket from "../socket"; // import the socket instance
import DocsLayout from "../layouts/DocsLayout";

function DocsBoard() {
  //navigator is use to copy our shared code to clip board
  const navigate = useNavigate();

  //use of that state variable for store all documents
  const [documents, setDocuments] = useState([]);

  //use of that state is for store title,content,keywords,section of document
  //this all state is used in create and edit document modal
  //We can pass this state to NoteFormModal component and DocumentModel component
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [section, setSection] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  
  //this state is used in edit document modal to know which document is editing
  //this state is Use to sort documents by selection time, created time, updated time

  //This state is use to display edit document modal
  const [editingDocument, setEditingDocument] = useState(null);
  //this state is use to display selected document in DocumentModel component
  const [selectedDocument, setSelectedDocument] = useState(null);
  //this state is use to display create document modal
  const [createdDocument, setCreatedDocument] = useState(false);

  //this State is Use in DocumentModel component to show share code after sharing a document
  const [shareCodes, setShareCodes] = useState({});

  const [showEditModal, setShowEditModal] = useState(false);
  const [shareCodeInput, setShareCodeInput] = useState("");
  //this state will indicate after join document Display NOTE PREVIEW
  const [sharedDocumentPreview, setSharedDocumentPreview] = useState(null);

  const [sortOption, setSortOption] = useState("recent");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filter states
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");




  // --- SOCKET EFFECT FOR documentsBOARD ---
  useEffect(() => {
    //get current user from local storage
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = currentUser?._id || currentUser?.id;
    
    // Join a personal room to receive user-specific events (e.g. being removed from a document)
    if (currentUserId) {
      socket.emit("joinUserRoom", currentUserId);
    }

    //Call when document is created in documentController.js file And add that new document to documents list if current user is owner or collaborator
    const handleNoteCreated = (newDocument) => {
      // Add new document if current user is the owner or collaborator
      const isAccessible =
        newDocument.user?._id === currentUserId ||
        newDocument.user === currentUserId ||
        (newDocument.collaborators || []).some(
          (c) =>
            c._id === currentUserId ||
            c.user === currentUserId ||
            c.user?._id === currentUserId
        );

      if (isAccessible) {
        setDocuments((prev) =>
          handleFilterChange(sortOption, [newDocument, ...prev], sortOrder)
        );
      }
    };

    
    //Call when document is updated in documentController.js file
    
//     1️⃣ Does the current user still have access to the note?
          // (owner or collaborator)
//     2️⃣ If user lost access → remove the document from the list
//     3️⃣ If user still has access → update the document or add it if new
  
    const handleNoteUpdated = (updatedDocument) => {
      
      // If user lost access, remove it from list
      const isAccessible =
        //check if current user is owner
        updatedDocument.user?._id === currentUserId ||
        updatedDocument.user === currentUserId ||
        //check if current user is collaborator
        (updatedDocument.collaborators || []).some(
          (c) =>
            c._id === currentUserId ||
            c.user === currentUserId ||
            c.user?._id === currentUserId
        );
      
    
      //Extract documents list store in setDocuments state and update that list
      setDocuments((prev) => {
        const exists = prev.some((n) => n._id === updatedDocument._id);

        if (!isAccessible && exists) {
          // remove document if lost access
          if (selectedDocument?._id === updatedDocument._id) setSelectedDocument(null);
          return handleFilterChange(
            sortOption,
            prev.filter((n) => n._id !== updatedDocument._id),
            sortOrder
          );
        }

        // add/update document if accessible
        if (isAccessible) {
          if (exists) {
            //If document exist in our documents list then update that document
            //And Filter that document ex: filter option is recent then that updated document show in top
            return handleFilterChange(
              sortOption,
              prev.map((n) =>
                n._id === updatedDocument._id ? updatedDocument : n
              ),
              sortOrder
            );
          } else {
            return handleFilterChange(
              sortOption,
              [updatedDocument, ...prev],
              sortOrder
            );
          }
        }

        return prev;
      });
    };


    //Call when document is deleted in documentController.js file and if deleted document is selected document then close that document modal
    const handleNoteDeleted = (deletedId) => {
      //change in documents list by filtering deleted document
      setDocuments((prev) =>
        handleFilterChange(
          sortOption,
          prev.filter((n) => n._id !== deletedId),
          sortOrder
        )
      );

      //if we delete selected document then close Their model
      if (selectedDocument && selectedDocument._id === deletedId) {
        setSelectedDocument(null);
      }
    };

    
    // Handle when participants change for ANY document 
    //This function is call when participants change in documentController.js file
    const handleParticipantsChanged = ({ documentId, collaborators }) => {
      setDocuments((prev) => {
        const docItem = prev.find((n) => n._id === documentId);

        // If document not found in current state (maybe user just got added)
        // fetch new documents list (safe fallback)
        if (!docItem) {
          fetchDocuments();
          return prev;
        }

        // Check if current user still has access
        const isStillParticipant =
          docItem.user?._id === currentUserId ||
          docItem.user === currentUserId ||
          collaborators?.some(
            (p) =>
              p._id === currentUserId ||
              p.user === currentUserId ||
              p.user?._id === currentUserId
          );

        // If removed — remove from list and close modal if needed
        if (!isStillParticipant) {
          if (selectedDocument?._id === documentId) setSelectedDocument(null);
          return handleFilterChange(
            sortOption,
            prev.filter((n) => n._id !== documentId),
            sortOrder
          );
        }

        // Otherwise update collaborators list for that document
        return handleFilterChange(
          sortOption,
          prev.map((n) =>
            n._id === documentId ? { ...n, collaborators } : n
          ),
          sortOrder
        );
      });
    };

    // ✅ Register socket listeners documentCreate will be socket listener
    // it will handle by handleNoteCreated function is define in useEffect


    // Socket listener(client - side) = an event handler(e.g.socket.on("documentUpdated", handler))
    // that runs whenever the server emits that event.
    
    //Socket listener is use in controller when document is created, updated, deleted, participants changed

    //For example when Document is updated in documentController.js file then that time
    // we emit event by io.to(note._id.toString()).emit("documentUpdated", populated);
    // then that time this socket listener will listen that event and run handleNoteUpdated function

    //In populated we send updated document data from server to client
      
    // Handle real-time content changes (live text editing)
    const handleReceiveChanges = (payload) => {
      if (!payload) return;
      const { documentId, content: newContent, senderId } = payload;
      // Ignore if this client sent the changes
      if (senderId === socket.id) return;
      
      // Update content if we are currently editing THIS document
      if (editingDocument && editingDocument._id === documentId) {
        setContent(newContent);
      }
    };

    socket.on("documentCreated", handleNoteCreated);
    socket.on("documentUpdated", handleNoteUpdated);
    socket.on("documentDeleted", handleNoteDeleted);
    socket.on("participantsChanged", handleParticipantsChanged);
    socket.on("receive-changes", handleReceiveChanges);

    // ✅ Cleanup on unmount
    return () => {
      socket.off("documentCreated", handleNoteCreated);
      socket.off("documentUpdated", handleNoteUpdated);
      socket.off("documentDeleted", handleNoteDeleted);
      socket.off("participantsChanged", handleParticipantsChanged);
      socket.off("receive-changes", handleReceiveChanges);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOption, sortOrder, selectedDocument, editingDocument]);








  //All refresh Moments of Our Page

  //For Sorting Documents When Page Load First Time
  useEffect(() => {
    setSortOption("recent");
    setSortOrder("desc");
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDocuments((prev) => handleFilterChange(sortOption, prev, sortOrder));
  }, [sortOption, sortOrder]);

  useEffect(() => {
    if (!selectedDocument) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocument]);





  // All handle Function That will call by frontend component and 
  //That handle Function Also Call API-FUNCTION

  // --- get current user ---
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };
  const currentUser = getCurrentUser();

  // sorting According to option and order and sorting documents list
  //Call when sort option or sort order change
  const handleFilterChange = (option, documentsList, order) => {
    let sorted = [...documentsList];
    const multiplier = order === "asc" ? 1 : -1;

    if (option === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title) * multiplier);
    } else if (option === "createdAt") {
      sorted.sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * multiplier);
    } else if (option === "updatedAt") {
      sorted.sort((a, b) => (new Date(a.updatedAt) - new Date(b.updatedAt)) * multiplier);
    } else if (option === "recent") {
      sorted.sort(
        (a, b) =>
          (new Date(a.selectionTime || a.updatedAt || a.createdAt || 0) -
            new Date(b.selectionTime || b.updatedAt || b.createdAt || 0)) *
          multiplier
      );
    }
    return sorted;
  };

  // --- fetch documents ---
  const fetchDocuments = async () => {
    try {
      const res = await getDocuments();
      const sorted = handleFilterChange(sortOption, res.data, sortOrder);
      setDocuments(sorted);
    } catch (error) {
      alert("Error fetching documents");
    }
  };



  // --- logout ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --- create/update document ---

  //When form is submit in create or edit DocumentFormModal component then this function will call
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const documentData = { title, section, content, keywords };
      if (editingDocument) {
        await updateDocument(editingDocument._id, documentData);
        alert("Document updated!");
      } else {
        await createDocument(documentData);
        alert("Document created!");
      }

      setTitle("");
      setSection("");
      setContent("");
      setKeywords([]);
      setKeywordInput("");
      setEditingDocument(null);
      fetchDocuments();
    } catch (error) {
      alert("Error saving document");
      console.error(error.response?.data || error.message);
    }
  };

  // --- delete document ---

  //When Delete button click in DocumentModel component then this function will call
  const handleDelete = async (id) => {
    if (window.confirm("Delete this document?")) {
      try {
        //call deleteDocument api function and pass document id to delete that document
        const res = await deleteDocument(id);
        alert(res.data.message);
        fetchDocuments();
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting document");
      }
    }
  };

  // --- edit document ---
  const handleEdit = (document) => {
    setEditingDocument(document);
    setTitle(document.title);
    setContent(document.content);
    setKeywords(document.keywords || []);
    setSection(document.section || "");
    setShowEditModal(true);
  };

  // --- share document ---
  const handleShare = async (id) => {
    try {
      const docItem = documents.find((n) => n._id === id);
      if (!docItem || !currentUser) return alert("❌ Unable to verify document ownership");

      const ownerId = docItem.user?._id || docItem.user;
      const currentUserId = currentUser.id || currentUser._id;
      if (ownerId !== currentUserId) return alert("❌ Only the owner can share this document");

      const res = await shareDocument(id);
      const code = res.data.shareCode;
      setShareCodes((prev) => ({ ...prev, [id]: code }));
      setDocuments((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isShared: true } : n))
      );
    } catch (error) {
      console.error(error);
      alert("Error sharing document");
    }
  };

  // this function will copy our code to clip board by using navigator

  // this function use in DocumentModel component when we click on copy button
  // this function use in DocsBoard component when we click on copy button in documentCard component
  const copyToClipboard = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => alert("📋 Code copied: " + code))
      .catch(() => alert("Failed to copy code"));
  };


  
  // --- keywords ---
  //this function is use in DocumentFormModal component to add keyword to keywords list
  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword) => setKeywords(keywords.filter((t) => t !== keyword));



  // --- join shared document ---

  //This function is use in JoinDocument component when we click on join document button
  const handleJoinDocument = async () =>
  {
    if (!shareCodeInput || shareCodeInput.length < 8) {
      return alert("Enter a valid share code!");
    }
    try {
      //Call api function getSharedDocument to get document preview by share code
      const preview = await getSharedDocument(shareCodeInput);

      //Set document preview to state to display in JoinDocument component
      setSharedDocumentPreview(preview.data);


      //set time out for display document preview so Document preview show for 3 sec
      setTimeout(async () => {
        try {
          //Call api function joinSharedDocument to join that document by share code
          await joinSharedDocument(shareCodeInput);
          //Fetch updated documents list after joining
          await fetchDocuments();

          //Hide document preview and clear share code input
          setSharedDocumentPreview(null);
          setShareCodeInput("");
        } catch (err) {
          console.error(err);
          alert("❌ Failed to join shared document");
        }
      }, 3000);

    } catch (error) {
      console.error(error);
      alert("❌ Invalid or expired share code");
    }
  };






  // --- history (undo/redo) ---

  //Same logic is use in DocumentFormModal.js file
  const [history, setHistory] = useState([""]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(value);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };





  // --- document click ---

  //When Cliclk on any document card in documents list then this function will call

  //Update selection time of that document and set that document to selectedDocument state to display in documentModal component
  const handleNoteClick = async (docItem) => {
    try {
      //api function call to update selection time of that document
      await updateSelectionTime(docItem._id);

      //Update documents list with new selection time and set selected document to open document modal
      setDocuments((prev) =>
        handleFilterChange(
          sortOption,
          prev.map((n) =>
            n._id === docItem._id
              ? { ...n, selectionTime: new Date().toISOString() }
              : n
          ),
          sortOrder
        )
      );

      //Set selected document to open document modal
      setSelectedDocument(docItem);

    } catch (err) {
      console.error("Failed to update selectionTime", err);
      setSelectedDocument(docItem);
    }
  };

  
  
  
  // --- search ---

  //Code run all time when document is render
  const [searchQuery, setSearchQuery] = useState("");

  let filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections = [...new Set(filteredDocuments.map((n) => n.section).filter(Boolean))];
  const keywordsList = [...new Set(filteredDocuments.flatMap((n) => n.keywords).filter(Boolean))];

  filteredDocuments = filteredDocuments.filter((document) => {
    const matchSection = selectedSection ? document.section === selectedSection : true;
    const matchKeyword = selectedKeyword ? document.keywords.includes(selectedKeyword) : true;
    return matchSection && matchKeyword;
  });
  

  return (
    <DocsLayout>
      <div style={{ padding: "20px" }}>
      <Navbar onLogout={handleLogout} />
      <br />

      {/* Create Document Button  change state true => setCreatedDocument*/}
      <CreateNoteButton onClick={() => setCreatedDocument(true)} />

      {/* Create Document Modal */}
      <NoteFormModal
        isOpen={createdDocument}
        onClose={() => setCreatedDocument(false)}
        onSubmit={(e) => {
          handleSubmit(e);
          setCreatedDocument(false);
        }}
        mode="create"
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        section={section}
        setSection={setSection}
        handleContentChange={handleContentChange}
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        keywords={keywords}
        addKeyword={addKeyword}
        removeKeyword={removeKeyword}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        historyIndex={historyIndex}
        history={history}
      />

      {/* Edit Document Modal */}
      <NoteFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingDocument(null);
        }}
        onSubmit={(e) => {
          handleSubmit(e);
          setShowEditModal(false);
        }}
        mode="edit"
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        section={section}
        setSection={setSection}
        handleContentChange={handleContentChange}
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        keywords={keywords}
        addKeyword={addKeyword}
        removeKeyword={removeKeyword}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        historyIndex={historyIndex}
        history={history}
        socket={socket}
        documentId={editingDocument?._id}
      />

      <hr />

      <JoinNote
        shareCodeInput={shareCodeInput}
        setShareCodeInput={setShareCodeInput}
        handleJoinDocument={handleJoinDocument}
        sharedDocumentPreview={sharedDocumentPreview}
      />

      <hr />
      {/* Sort and Filter Bars */}
      <SortFilter
        sortOption={sortOption}
        /*useEffect will call when sort option change*/
        setSortOption={setSortOption}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Filter Bar */}
      <FilterBar
        sections={sections}
        keywords={keywordsList}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        selectedKeyword={selectedKeyword}
        setSelectedKeyword={setSelectedKeyword}
      />

      <hr />

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Documents list */}
      <div style={{ padding: "24px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#1f2937",
          }}
        >
          My Documents
        </h2>

        <div
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <NoteCard
                key={document._id}
                document={document}
                /*Change selected time , Change docment list and open document modal*/
                onClick={() => handleNoteClick(document)}
                /*Use in document card component when we click on edit,delete,share and copy button button*/
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShare={handleShare}
                shareCode={shareCodes[document._id]}
                copyToClipboard={copyToClipboard}
              />
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#6b7280" }}>
              No documents yet
            </p>
          )}
        </div>

        {selectedDocument && (
          <NoteModal
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onShare={handleShare}
            shareCode={shareCodes[selectedDocument._id]}
            copyToClipboard={copyToClipboard}
            setShowEditModal={setShowEditModal}
            onParticipantsUpdated={fetchDocuments} // ✅ ensure refresh on participant change
          />
        )}
      </div>
      </div>
    </DocsLayout>
  );
}

export default DocsBoard;