const express = require("express");
const router = express.Router();
const {
  shareDocumentByEmail,
  getPendingInvites,
  acceptInvite,
  rejectInvite,
} = require("../controllers/shareController");
const { protect } = require("../middleware/authMiddleware");

router.post("/share", protect, shareDocumentByEmail);
router.get("/invites", protect, getPendingInvites);
router.post("/accept", protect, acceptInvite);
router.post("/reject", protect, rejectInvite);

module.exports = router;
