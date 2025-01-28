import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Handle socket connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.emit("joined-room", `Joined room: ${roomId}`);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Handle custom events in a room
  socket.on("play", ({ roomId, time }) => {
    console.log(`Play: ${time}`);
    socket.to(roomId).emit("play-client", { sender: socket.id, time });
  });

  socket.on("pause", ({ roomId, time }) => {
    console.log(`Pause: ${time} - ${roomId}`);
    socket.to(roomId).emit("pause-client", { sender: socket.id, time });
  });

  // Leave a room
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
    socket.to(roomId).emit("user-left", `User ${socket.id} left the room.`);
  });

  // Handle disconnect
  socket.on("disconnect", (e) => {
    console.log("A user disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running`);
});