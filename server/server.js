const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// express → creates APIs

// mongoose → connects to MongoDB database

// cors → allows frontend & backend to talk even if on different URLs

// http → used to create server (needed for socket.io)

// socket.io → real-time communication (live editing)

// dotenv → loads .env file (for secrets like MONGO_URI)



// Init app
const app = express();
//express.json() is a built-in middleware function in Express.js.
app.use(express.json());
app.use(cors());


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));


//connecting auth, documents and share Route file with my Express server
// Routes
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
const shareRoutes = require("./routes/shareRoutes");
app.use("/api/share", shareRoutes);



// Create HTTP server instead of app.listen
const server = http.createServer(app);
// Setup Socket.IO      
//make one seprate server for socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // frontend URL here
    methods: ["GET", "POST"],
  },
});

// Pass socket instance to controllers
const { setSocketInstance } = require("./controllers/documentController");
setSocketInstance(io);

// Socket events that will Use in front end for Join and Leave Document
io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  // Join Document room    joinDocument=>Socket Event Name
  socket.on("joinDocument", (documentId) => {
    socket.join(documentId);
    console.log(`User ${socket.id} joined room: ${documentId}`);
  });

  // Leave Document room
  socket.on("leaveDocument", (documentId) => {
    socket.leave(documentId);
    console.log(`User ${socket.id} left room: ${documentId}`);
  });
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});





// Start server (only once)
const PORT = process.env.PORT || 5000;
// ⭐ server.listen() starts the server for Express ONLY.
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);