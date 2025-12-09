import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocuments, createDocument } from '../api/docsApis';
import Navbar from "../components/layout/Navbar";
import GoToDocsBoardButton from "../components/layout/GoToDocsBoardButton";
import CreateNoteButton from "../components/documents/CreateDocumentButton";
import NoteFormModal from "../components/documents/DocumentFormModal";
import NoteCard from "../components/documents/DocumentCard"; // ✅ Import NoteCard
import UserDetailsCard from "../components/dashboard/UserDetailsCard";
import StatsCard from "../components/dashboard/StatsCard";
import { getPendingInvites, acceptInvite, rejectInvite } from "../api/docsApis";            
import DocsLayout from "../layouts/DocsLayout";


//This component is used to display documents shared with the current user

//This component have a two args
//             One is documents => All document of User
//             currentUserId => logged in user id

const SharedDocuments = ({ documents = [], currentUserId }) =>
{
  //Filter documents shared with current user 
  //Filter logic: document owner is not current user AND current user is in collaborators array
  const shared = documents.filter(
    (n) => (n.user?._id || n.user) !== currentUserId && (n.collaborators || []).some(c => (c.user?._id || c.user) === currentUserId)
  );
  if (!shared.length) return <p style={{ color: "#6b7280" }}>No shared documents</p>;
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
      {shared.map((document) => (
        <NoteCard key={document._id} document={document} onClick={() => {}} />
      ))}
    </div>
  );
};


//This component is used to display pending invites(document) for the logged-in user
const PendingInvites = () =>
{
  //Store pending invites documents
  const [invites, setInvites] = useState([]);
  //Use for Display "Loading..." when fetching pending invites
  const [loading, setLoading] = useState(false);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      //Call API function getPendingInvites api to get all pending invites for logged in user
      const res = await getPendingInvites();
      setInvites(res.data || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  //when Rendering component then fetch pending invites
  useEffect(() => { fetchInvites(); }, []);

  if (loading) return <p>Loading...</p>;
  if (!invites.length) return <p style={{ color: "#6b7280" }}>No pending invites</p>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {invites.map((n) => (
        <div key={n._id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <b>{n.title}</b>
            <div style={{ color: "#6b7280" }}>From: {n.user?.email || n.user?.name || "Owner"}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {/*When user click on Accept Button then call acceptInvite API Function to accept invite*/}
            <button onClick={async () => { await acceptInvite(n._id); fetchInvites(); }} style={{ background: "#10b981", color: "white", padding: "6px 10px", borderRadius: 6 }}>Accept</button>
            {/*When user click on Decline Button then call rejectInvite API Function to reject invite*/}
            <button onClick={async () => { await rejectInvite(n._id); fetchInvites(); }} style={{ background: "#ef4444", color: "white", padding: "6px 10px", borderRadius: 6 }}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
};


// Local minimal components to avoid undefined errors
// Tabs and Tab components for tabbed interface
const Tabs = ({ children }) => <div>{children}</div>;
const Tab = ({ title, children }) => (
  <section style={{ marginTop: 16 }}>
    <h3 style={{ margin: "8px 0" }}>{title}</h3>
    {children}
  </section>
);














function Dashboard() {
  const navigate = useNavigate();

  // ✅ States

  //Maintain Document List
  const [documents, setDocuments] = useState([]); // all documents
  
  // Create Document Modal
  //If setCreatedDocument is true then open modal otherwise close modal
  const [createdDocument, setCreatedDocument] = useState(false);


  // New Document Fields Use For Pass To DocumentFormModal.js file
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [section, setSection] = useState("");

  // Keywords Management
  // Keyword input field
  const [keywordInput, setKeywordInput] = useState("");
  // list of keywords
  const [keywords, setKeywords] = useState([]);
  
  // Undo/Redo History
  //history array to store content history
  const [history, setHistory] = useState([""]);
  //historyIndex to track current position in history
  const [historyIndex, setHistoryIndex] = useState(0);

  
  //For Current User Details
  const getCurrentUser = () => {
    try {
      //JWT token stored in localStorage after login
      //take user details from localStorage
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };
  const currentUser = getCurrentUser();

  
  
  //Fetching Documents on Component Mount
  useEffect(() => {
    // ✅ Fetch documents on mount
    fetchDocuments();
  }, []);

  // ✅ Fetch all documents
  const fetchDocuments = async () => {
    try {
      const res = await getDocuments();
      //set documents in documents state list
      setDocuments(res.data);
    } catch {
      alert("Error fetching documents");
    }
  };



  // Handle Content Change with history

  //This method is use in DocumentFormModal.js file to handle content change with history for undo redo
  const handleContentChange = (e) => {
    // Get new content from event
    const newContent = e.target.value;

    // Update history for undo/redo
    const updatedHistory = [...history.slice(0, historyIndex + 1), newContent];
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);

    // Update content state
    setContent(newContent);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      
      setContent(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  // ✅ Keyword handlers
  const addKeyword = () => {
    if (keywordInput && !keywords.includes(keywordInput)) {
      setKeywords([...keywords, keywordInput]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword) => {
    setKeywords(keywords.filter((t) => t !== keyword));
  };

  // ✅ Submit new document
  const handleSubmit = async () => {
    try {
      // Call createDocument API
      await createDocument({ title, content, section, keywords });
      // Refresh document list
      fetchDocuments();

      // Reset form fields
      setTitle("");
      setContent("");
      setSection("");
      setKeywords([]);
    } catch {
      alert("Error creating document");
    }
  };


  // ✅ Logout   Use In Navbar.js file
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };


  //  Stats   Use In StatsCard.js file
  // Calculate total documents
  const totalDocuments = documents.length;
  // Calculate total keywords across all documents
  const totalKeywords = documents.reduce((acc, document) => acc + (document.keywords ? document.keywords.length : 0), 0);

  return (
    <DocsLayout>
      <div style={{ padding: "20px" }}>
      <Navbar onLogout={handleLogout} />
      <h1 style={{ marginBottom: "20px", textAlign: "center" }}>🧾 DocsMaster Workspace</h1>
``
      <UserDetailsCard user={currentUser} />

      <hr></hr>

      <StatsCard totalDocuments={totalDocuments} totalKeywords={totalKeywords} />

      <hr></hr>

      {/* ✅ Reusable components */}
      <GoToDocsBoardButton />

      <hr></hr>

      <CreateNoteButton onClick={() => setCreatedDocument(true)} />

      {/* Create Document Modal */}
      <NoteFormModal
        isOpen={createdDocument}
        onClose={() => setCreatedDocument(false)}
        //onSubmit is Method which is call when form is submit
        onSubmit={(e) => {
          // Prevent default form submission
          e.preventDefault();
          // Call handleSubmit to create document
          handleSubmit();
          // Close modal after submission
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

      <hr></hr>

      {/* ✅ My Documents Section */}
      <div style={{ padding: "24px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#1f2937",
          }}
        >
          Recent Documents
        </h2>

        <div
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
          >

          {/* Display NoteCards for each document */}
          {documents.length > 0 ? (
            documents.map((document) => (
              <NoteCard
                key={document._id}
                document={document}
                onClick={() => {}}
              />
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#6b7280" }}>
              No documents yet
            </p>
          )}
        </div>
        </div>
          
      <Tabs>
        <Tab title="Shared With Me">
          <SharedDocuments documents={documents} currentUserId={currentUser?.id || currentUser?._id} />
        </Tab>
        <Tab title="Pending Invites">
          <PendingInvites />
        </Tab>
      </Tabs>
      </div>
    </DocsLayout>
  );
}

export default Dashboard;