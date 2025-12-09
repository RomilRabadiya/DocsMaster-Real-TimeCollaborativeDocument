const mongoose = require("mongoose");

//collaboratorSchema is Store all collaborators with their roles in a document
const collaboratorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["reader", "editor"],
      default: "reader",
    },
  },
  { _id: false }
);

// When We invite someone By email Then they go into pendingCollaborators
const pendingCollaboratorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending"], default: "pending" },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    subject: { type: String, trim: true, default: "" },

    // owner
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },



    // collaborators with role
    collaborators: [collaboratorSchema],
    // pending invitations awaiting accept/reject
    pendingCollaborators: { type: [pendingCollaboratorSchema], default: [] },


    shareCode: { type: String, unique: true, sparse: true }, // Unique code for sharing
    //check if note is shared
    isShared: { type: Boolean, default: false },


    // timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    selectionTime: { type: Date, default: Date.now },

    // Track who modified
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);


// Middleware to update `updatedAt` automatically
documentSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});


// Virtual field to map 'tags' to 'keywords' for client compatibility
//Convert Our Project NoteMaster To DocsMaster
documentSchema.virtual('keywords').get(function() {
  return this.tags;
});

// Include virtuals when converting to JSON
documentSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model("Document", documentSchema);//We can Return Document Model to other files
//Name of collection will be documents in MongoDB
//Use require('./models/Document') to import this Document model in other files