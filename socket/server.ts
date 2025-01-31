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
  console.log("Initial rooms:", socket.rooms);

  // Join a room
  socket.on("join-room", async (roomId) => {
    await socket.join(roomId);
    io.to(roomId).emit("joined-room", { roomId, sender: socket.id });
  });

  // Handle custom events in a room
  socket.on("play", ({ roomId, time, video, to }) => {
    console.log(`Play: ${time} - ${roomId}`);
    io.to(to ?? roomId).emit("play-client", { sender: socket.id, time, video });
  });

  socket.on("pause", ({ roomId, time, to }) => {
    console.log(`Pause: ${time} - ${roomId}`);
    io.to(to ?? roomId).emit("pause-client", { sender: socket.id, time });
  });

  // Leave a room
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
    socket.to(roomId).emit("left-room", socket.id);
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