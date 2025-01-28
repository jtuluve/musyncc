const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Handle socket connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a room
  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    socket.to(room).emit("user-joined", `User ${socket.id} joined the room.`);
  });

  // Handle custom events in a room
  socket.on("message-room", ({ room, message }) => {
    console.log(`Message to room ${room} from ${socket.id}: ${message}`);
    socket.to(room).emit("message-received", { sender: socket.id, message });
  });

  // Leave a room
  socket.on("leave-room", (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
    socket.to(room).emit("user-left", `User ${socket.id} left the room.`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});