const express = require("express");
const Document = require("../models/Document");
const {
  createDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  shareDocument,
  getSharedDocument,
  joinSharedDocument,
  updateSelectionTime,
  changeParticipantRole,
  removeParticipant,
} = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


//Make APIS For Backend Document Management
//Make APIS For Backend Document Management

//Generate Router For All method in documentController.js With Some URLs
// And Make Protected Routes By using protect middleware from authMiddleware.js file

//Generate One unique URL for each method in documentController.js file
// So we will we use that URL in frontend to access that method By src/api/noteApis.js file


// Protected routes

// When APIS Request is get from browser
//         |
//     First Go to Middleware to check user is authenticated or not by checking token
//              |
//          If authenticated then only go to Controller method to perform action


router.post("/", protect, createDocument);
router.get("/", protect, getDocuments);
router.put("/:id", protect, updateDocument);
router.delete("/:id", protect, deleteDocument);
router.post("/:id/share", protect, shareDocument);

// Public routes
router.get("/shared/:code", getSharedDocument);

// Protected: join a shared note by code
router.post("/shared/:code/join", protect, joinSharedDocument);

// 🔥 Protected: update selection time when user views a not
router.put("/:id/selection", protect, updateSelectionTime);

// ✅ Add routes for managing collaborators
router.put("/:documentId/collaborators/:userId", protect, changeParticipantRole);
router.delete("/:documentId/collaborators/:userId", protect, removeParticipant);


// Get shared documents for logged-in user
router.get("/shared", protect, async (req, res) => {
  const userId = req.user.id;
  const documents = await Document.find({ "collaborators.user": userId })
    .populate("user", "email name");
  res.json(documents);
});



module.exports = router;