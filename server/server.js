const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");

const { Server } = require("socket.io");

const connectDB = require("./config/db");

const Message = require("./models/Message");

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// Middlewares
app.use(cors());

app.use(express.json());

// Routes
app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/rooms",
  require("./routes/roomRoutes")
);

app.use(
  "/api/messages",
  require("./routes/messageRoutes")
);

// Test Route
app.get("/", (req, res) => {
  res.send("API Running");
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// Socket connection
const onlineUsers = {};
io.on("connection", (socket) => {
  console.log("User Connected");

  // Join room
socket.on("join-room", (data) => {
  const { roomId, username } = data;

  socket.join(roomId);

  if (!onlineUsers[roomId]) {
    onlineUsers[roomId] = [];
  }

  onlineUsers[roomId].push(username);

  io.to(roomId).emit(
    "online-users",
    onlineUsers[roomId]
  );

  console.log(`${username} joined ${roomId}`);
});

  // Send message
  socket.on("send-message", async (data) => {
    try {
      // Save message in MongoDB
      await Message.create({
        roomId: data.roomId,
        username: data.username,
        text: data.text,
      });

      // Emit realtime message
      io.to(data.roomId).emit(
        "receive-message",
        data
      );
    } catch (error) {
      console.log(error);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

// Start server
server.listen(5000, () => {
  console.log("Server is running");
});