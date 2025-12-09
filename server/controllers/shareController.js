const Document = require("../models/Document");
const User = require("../models/user");

// 📩 Share document by email (owner only)


// URL: POST /api/share/share

//After Enter Email and Click on Invite Button This method is called
exports.shareDocumentByEmail = async (req, res) => {
  try {
    //documentId=> Which document to share
    //email=> Whom to share (Input)
    const { documentId, email } = req.body;
    const senderId = req.user._id;

    const receiver = await User.findOne({ email });
    if (!receiver) return res.status(404).json({ message: "User not found" });

    // Owner must exist on the note

    //Document Owner Must Be Sender
    const note = await Document.findOne({ _id: documentId, user: senderId });
    if (!note) return res.status(404).json({ message: "Document not found or unauthorized" });

    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: "Cannot invite yourself" });
    }

    // Avoid duplicates
    const already =
      note.collaborators.some(
        (c) => c.user.toString() === receiver._id.toString()
      ) ||
      note.pendingCollaborators?.some(
        (p) => p.user.toString() === receiver._id.toString()
      );

    if (already)
      return res.status(400).json({ message: "Already shared with this user" });


    // Add to pending collaborators
    note.pendingCollaborators = note.pendingCollaborators || [];
    note.pendingCollaborators.push({ user: receiver._id, status: "pending" });

    note.isShared = true;
    note.modifiedBy = senderId;
    await note.save();

    res.json({ message: "Invitation sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 📜 Get pending invites for logged-in user
// URL: GET /api/share/invites

//This method is called to get all pending invites for logged in user
exports.getPendingInvites = async (req, res) => {
  try {
    //Logged in user Who want to see pending invites
    const userId = req.user._id;

    //Check all documents where logged in user is in pendingCollaborators
    const invites = await Document.find({ "pendingCollaborators.user": userId })
      .populate("user", "name email")
      .populate("pendingCollaborators.user", "name email")
      .select("title user pendingCollaborators");

    res.json(invites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Accept invite

//This method is called when user accept invite And click on Accept Button

//Work of this method is Remove user from pendingCollaborators and add to collaborators array
exports.acceptInvite = async (req, res) => {
  try {
    //Get documentId from request body
    const { documentId } = req.body;
    const userId = req.user._id;

    //Find document by Id
    const note = await Document.findById(documentId);
    if (!note) return res.status(404).json({ message: "Document not found" });

    // Only invited users can accept

    //Check in pendingCollaborators array Of note Variable(note => get from request body After click on Accept Button of panding invites)
    const isPending = note.pendingCollaborators?.some((p) => p.user.toString() === userId.toString());
    if (!isPending) return res.status(400).json({ message: "No pending invite found" });

    // Remove from pending and add to collaborators
    note.pendingCollaborators = (note.pendingCollaborators || []).filter(
      (p) => p.user.toString() !== userId.toString()
    );

    // Avoid duplicate collaborators
    const alreadyCollab = note.collaborators.some((c) => c.user.toString() === userId.toString());
    if (!alreadyCollab) note.collaborators.push({ user: userId, role: "editor" });
    note.isShared = true;
    note.modifiedBy = userId;
    await note.save();

    res.json({ message: "Invitation accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Reject invite

//This method is called when user reject invite And click on Reject Button
//Work of this method is Remove user from pendingCollaborators array
exports.rejectInvite = async (req, res) => {
  try {
    const { documentId } = req.body;
    const userId = req.user._id;

    const note = await Document.findById(documentId);
    if (!note) return res.status(404).json({ message: "Document not found" });

    const before = (note.pendingCollaborators || []).length;
    note.pendingCollaborators = (note.pendingCollaborators || []).filter(
      (p) => p.user.toString() !== userId.toString()
    );
    const after = note.pendingCollaborators.length;
    if (before === after) return res.status(400).json({ message: "No pending invite found" });

    note.modifiedBy = userId;
    await note.save();

    res.json({ message: "Invitation declined" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};