//Document Management APIs
//getDocuments => To Get All Documents     Controller Method is getDocuments
//createDocument => To Create New Document   Controller Method is createDocument
//updateDocument => To Update Existing Document   Controller Method is updateDocument
//deleteDocument => To Delete Existing Document   Controller Method is deleteDocument
//shareDocument => To Share Document     Controller Method is shareDocument
//getSharedDocument => To Get Shared Document   Controller Method is getSharedDocument
//joinSharedDocument => To Join Shared Document   Controller Method is joinSharedDocument
//updateSelectionTime => To Update Selection Time   Controller Method is updateSelectionTime

//changeParticipantRole => To Change Participant Role   Controller Method is changeParticipantRole
//removeParticipant => To Remove Participant   Controller Method is removeParticipant



//axios is feature of node.js that is used to make HTTP requests from node.js
//we can use axios to make API requests to our backend server
import axios from "axios";

const API_URL = "http://localhost:5000/api/documents"; // adjust if needed


//      In this Code we have Create API-FUNCTION for All URL which is define in documentRoutes.js file
//      and that documentRoutes.js Route All method which is define in noteController.js file to URL

//      This API-FUNCTION is used in frontend to access backend method

//      and we have use getAuthHeaders() function to check user is authenticated or not by checking token in header
//      if user is authenticated then only user can access protected routes otherwise not


// Helper: get auth headers
const getAuthHeaders = () => {

  // Get token from localStorage (or any other storage)
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};





// Create Document
// URL : /api/documents  [GET]
export const getDocuments = async () => {
  return axios.get(API_URL, {
    //check token in header if user Authenticated or not
    headers: getAuthHeaders(),//check token in header if user Authenticated or not
    //Simple mean of getAuthHeaders() function is to return { Authorization: `Bearer ${token}`
  });
};

// URL  : /api/documents  [POST]
export const createDocument = async (documentData) => {
  return axios.post(API_URL, documentData, {
    headers: getAuthHeaders(),//check token in header if user Authenticated or not
    //Simple mean of getAuthHeaders() function is to return { Authorization: `Bearer ${token}`
  });
};



// Update document (protected)
// URL : /api/documents/:id  [PUT]
export const updateDocument = async (id, documentData) => {
  return axios.put(`${API_URL}/${id}`, documentData, {
    headers: getAuthHeaders(),
  });
};



// ✅ Delete document (protected)
// URL : /api/documents/:id  [DELETE]
export const deleteDocument = async (id) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
};



// ✅ Share document (protected)
// URL : /api/documents/:id/share  [POST]
export const shareDocument = async (id) => {
  return axios.post(`${API_URL}/${id}/share`, {}, {
    headers: getAuthHeaders(),
  });
};

// ✅ Update selection time (protected)
// URL : /api/documents/:id/selection  [PUT]
export const updateSelectionTime = async (id) => {
  return axios.put(`${API_URL}/${id}/selection`, {}, {
    headers: getAuthHeaders(),
  });
};






// ✅ Join shared document (protected)
// URL : /api/documents/shared/:code/join  [POST]
export const joinSharedDocument = async (code) => {
  return axios.post(`${API_URL}/shared/${code}/join`, {}, {
    headers: getAuthHeaders(),
  });
};


// ✅ Get shared document (public, no token required)
// URL : /api/documents/shared/:code  [GET]
export const getSharedDocument = async (code) => {
  return axios.get(`${API_URL}/shared/${code}`);
};






// ✅ Change participant role (protected, owner only)
// URL : /api/documents/:documentId/collaborators/:userId  [PUT]
export const changeParticipantRole = async (documentId, userId, role) => {
  return axios.put(`${API_URL}/${documentId}/collaborators/${userId}`, { role }, {
    headers: getAuthHeaders(),
  });
};

// ✅ Remove participant (protected, owner only)
// URL : /api/documents/:documentId/collaborators/:userId  [DELETE]
export const removeParticipant = async (documentId, userId) => {
  return axios.delete(`${API_URL}/${documentId}/collaborators/${userId}`, {
    headers: getAuthHeaders(),
  });
};



// =====================
// Sharing via Email APIs
// Base: /api/share
// =====================
const SHARE_API = "http://localhost:5000/api/share";

// Send invitation by email (owner only)
// URL : /api/share/share  [POST]
export const shareDocumentByEmail = async (documentId, email) => {
  return axios.post(`${SHARE_API}/share`, { documentId, email }, {
    headers: getAuthHeaders(),
  });
};

// Get pending invites for current user
// URL : /api/share/invites  [GET]
export const getPendingInvites = async () => {
  return axios.get(`${SHARE_API}/invites`, {
    headers: getAuthHeaders(),
  });
};

// Accept invite for a document
// URL : /api/share/accept  [POST]
export const acceptInvite = async (documentId) => {
  return axios.post(`${SHARE_API}/accept`, { documentId }, {
    headers: getAuthHeaders(),
  });
};

// Reject invite for a document
// URL : /api/share/reject  [POST]
export const rejectInvite = async (documentId) => {
  return axios.post(`${SHARE_API}/reject`, { documentId }, {
    headers: getAuthHeaders(),
  });
};