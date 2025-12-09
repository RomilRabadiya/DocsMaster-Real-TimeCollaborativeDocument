const Document = require("../models/Document");

//   createDocument : Create a new note
//   updateDocument : Update an existing note
//   deleteDocument : delete a note
//   getDocuments   : Get all documents for a user

//   shareDocument  : Share a note to other User and generate a share code
//   getSharedDocument : Get share note using share code
//        In Middle Of this Two method we have Display Document Preview Write Code in join Document.js component
//        Document Preview will display for
//   joinSharedDocument  :  Join a shared note using share code
//        Join Shared Document And Add Collaborator as Reader Role And User Display that shared Document in their Document List

//   updateSelectionTime,
          //when user can select Document Model selectionTime will be updated
        
//   removeParticipant,
//   changeParticipantRole,




// Get socket.io instance for broadcasting
let io;

//socketInstance Pass By server.js file
const setSocketInstance = (socketInstance) => {
  io = socketInstance;
};



// ✅ Create a new note
const createDocument = async (req, res) => {
  try {
    const { title, content, tags, keywords, subject, isShared } = req.body;
    // Handle both 'tags' and 'keywords' field names
    const tagsArray = tags || keywords;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const note = new Document({
      title,
      content,
      tags: Array.isArray(tagsArray) ? tagsArray : (tagsArray ? tagsArray.split(",") : []),
      subject: subject || "",
      user: req.user._id,   // owner
      isShared: isShared || false,
      selectionTime: Date.now(),
      modifiedBy: null,
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: "Error creating note", error: error.message });
  }
};

// ✅ Update a note
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    //extract fields from body
    const { title, content, tags, keywords, subject, isShared } = req.body;
    
    // Handle both 'tags' and 'keywords' field names
    const tagsArray = tags || keywords;

    const note = await Document.findById(id);
    if (!note) return res.status(404).json({ message: "Document not found" });

    const isOwner = note.user.toString() === req.user._id.toString();

    //Check Current user is present in collaborators of variable "note"
    const isEditor = note.collaborators.some
    (
      (c) => c.user.toString() === req.user._id.toString() && c.role === "editor"
    );

    if (!isOwner && !isEditor) {
      return res.status(403).json({ message: "Not authorized to edit this note" });
    }

    //Update fields if provided
    if (title) note.title = title;
    if (content) note.content = content;
    if (subject) note.subject = subject;
    if (tagsArray) note.tags = Array.isArray(tagsArray) ? tagsArray : tagsArray.split(",");
    if (isShared !== undefined) note.isShared = isShared;

    //change modified
    note.modifiedBy = req.user._id;

    const updatedNote = await note.save();

    
    //Code for Live editing using Socket.io
    //Code for Live editing using Socket.io

    //Pass populated note to client
    // Emit real-time update to all clients in the note room
    const populated = await Document.findById(note._id)
      
      //populate mean to fetch user details from user id
      .populate("user", "email name")
      .populate("collaborators.user", "email name")
      .populate("modifiedBy", "email name");
    
    if (io) {
      // We can Call handleNoteUpdated function in client side : DocsBoard.js file
      io.to(note._id.toString()).emit("documentUpdated", populated);
    }
    
    // Before populate:
    // { user: "64a...f1", collaborators: [{ user: "65b...a2", role: "editor" }], modifiedBy: "64a...f1" }


    // After populate:
    // { user: { _id: "64a...", name: "Amit", email: "a@x.com" },
    //   collaborators: [{ user: { _id:"65b...", name:"Rita", email:"r@x.com" }, role: "editor" }],
    //   modifiedBy: { _id:"64a...", name:"Amit", email:"a@x.com" } }

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error: error.message });
  }
};


// ✅ Delete a note
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Document.findById(id);
    if (!note) return res.status(404).json({ message: "Document not found" });

    // Owner deletes → delete completely
    if (note.user.toString() === req.user._id.toString()) {
      await note.deleteOne();

      // Emit(mean call event like documentDeleted) real-time deletion to all clients in the note room
      if (io) {
        io.to(id).emit("documentDeleted", id);
      }

      return res.json({ message: "Document deleted from all accounts (owner action)" });
    }



    // Collaborator deletes → remove their reference only
    const isCollaborator = note.collaborators.some(
      (c) => c.user.toString() === req.user._id.toString()
    );
    if (isCollaborator) {

      // Remove collaborator entry for this user
      note.collaborators = note.collaborators.filter(
        (c) => c.user.toString() !== req.user._id.toString()
      );
      await note.save();
      return res.json({ message: "Document removed from your account only" });
    }

    return res.status(403).json({ message: "Not authorized to delete this note" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error: error.message });
  }
};

// ✅ Get all documents
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [{ user: req.user._id },//Your own documents
      { "collaborators.user": req.user._id }],//Documents shared with you , check in collaborators array
    })
      .sort({ selectionTime: -1, createdAt: -1 })//sort by selectionTime desc, then createdAt desc
      
      //populate mean to fetch user details from user id
      .populate("user", "email name")
      .populate("collaborators.user", "email name")
      .populate("modifiedBy", "email name");

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching documents", error: error.message });
  }
};



//Owner Share Document And code will be generated
// ✅ Share note
const shareDocument = async (req, res) => {
  try {
    //find document that id from params and user from req.user._id
    const note = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Document not found or unauthorized" });


    // generate unique code
    const generateCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length: 10 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    };

    
    let code, exists = true;
    // Ensure uniqueness of code in Our DB
    while (exists) {
      code = generateCode();
      exists = await Document.exists({ shareCode: code });
    }

    //change state of note
    note.shareCode = code;
    note.isShared = true;
    note.modifiedBy = req.user._id;
    await note.save();

    res.json({ shareCode: note.shareCode });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




// ✅ Get shared note (public)
const getSharedDocument = async (req, res) => {
  try {
    //find document that shareCode from params
    const note = await Document.findOne({ shareCode: req.params.code })
      
      //populate mean to fetch user details from user id
      .populate("user", "email name")
      .populate("collaborators.user", "email name")
      .populate("modifiedBy", "email name");

    if (!note) return res.status(404).json({ message: "Invalid share code" });

    //return note
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// ✅ Join shared note
const joinSharedDocument = async (req, res) => {
  try {
    //share code from params
    const { code } = req.params;
    //find document that shareCode from params
    const note = await Document.findOne({ shareCode: code });
    if (!note) return res.status(404).json({ message: "Invalid share code" });

    //check if user is owner
    const isOwner = String(note.user) === String(req.user._id);

    //check if user is already collaborator
    const alreadyCollaborator = note.collaborators.some(
      (c) => String(c.user) === String(req.user._id)
    );

    if (!isOwner && !alreadyCollaborator)
    {
      // Add as reader collaborator in note collaborators list
      note.collaborators.push({ user: req.user._id, role: "reader" });
      note.isShared = true;
      note.modifiedBy = req.user._id;
      await note.save();
    }


    //Pass populated note to client
    const populated = await Document.findById(note._id)
      //we can fetch user details from user
      .populate("user", "email name")
      //we can fetch collaborator details from collaborators
      .populate("collaborators.user", "email name")
      .populate("modifiedBy", "email name");

    // Broadcast new participant joining to all clients in the note room

    //documentUpdated logic is To check current user is been in current document list or not (document list is display in DocsBoard Page)
    if (io && !isOwner && !alreadyCollaborator) {
      io.to(note._id.toString()).emit("documentUpdated", populated);
      //documentParticipantsChanged logic is To check current user is been in current document list or not (document list is display in DocsBoard Page)
      io.to(note._id.toString()).emit("documentParticipantsChanged", populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Update selectionTime
const updateSelectionTime = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Document.findOne({
      _id: id,
      $or: [{ user: req.user._id }, { "collaborators.user": req.user._id }],
    });

    if (!note) return res.status(404).json({ message: "Document not found or unauthorized" });

    note.selectionTime = new Date();
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Error updating selection time", error: error.message });
  }
};


// ✅ Remove participant
const removeParticipant = async (req, res) => {
  try {
    const { documentId, userId } = req.params;
    //find document that id from params
    const note = await Document.findById(documentId);
    if (!note) return res.status(404).json({ message: "Document not found" });

    // Only owner can remove participants
    //So check current user is owner or not
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    //Update collaborators list
    note.collaborators = note.collaborators.filter(
      (c) => c.user.toString() !== userId
    );
    await note.save();

    const updated = await Document.findById(documentId)
      .populate("user", "email name")
      .populate("collaborators.user", "email name")
      .populate("modifiedBy", "email name");

    // Broadcast participant removal to all clients in the note room

    //documentUpdated logic is To check current user is been in current document list or not (document list is display in DocsBoard Page)

    if (io) {
      io.to(documentId).emit("documentUpdated", updated);
      io.to(documentId).emit("documentParticipantsChanged", updated);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error removing participant", error: error.message });
  }
};

// ✅ Change participant role
const changeParticipantRole = async (req, res) => {
  try {
    //documentId => Which Document?
    //userId => Which Participant?
    const { documentId, userId } = req.params;
    const { role } = req.body;

    const note = await Document.findById(documentId);
    if (!note) return res.status(404).json({ message: "Document not found" });

    // Only owner can change roles
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    //Find For Document => Colllaborators array Our Colllaborator is present or not 
    const collab = note.collaborators.find(
      (c) => c.user.toString() === userId
    );
    if (!collab) return res.status(404).json({ message: "Collaborator not found" });

    //Update role
    collab.role = role;
    await note.save();


    //Do our Collaborator List Live after Role Chnage of Collaborator
    const updated = await Document.findById(documentId)
      .populate("user", "email name")
      .populate("collaborators.user", "email name")
      .populate("modifiedBy", "email name");

    // Broadcast role change to all clients in the note room
    if (io) {
      io.to(documentId).emit("documentUpdated", updated);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error changing role", error: error.message });
  }
};

// ✅ Export
module.exports = {
  createDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  shareDocument,
  getSharedDocument,
  joinSharedDocument,
  updateSelectionTime,
  removeParticipant,
  changeParticipantRole,
  setSocketInstance,
};