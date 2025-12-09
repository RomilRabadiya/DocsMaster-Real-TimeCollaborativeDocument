import { io } from "socket.io-client";

const URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

// Initialize a single shared Socket.IO client
const socket = io(URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;