const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

// Configuration & Database connection
const connectDB = require("./config/db");

// Routes Imports
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const messageRoutes = require("./routes/messageRoutes");
const studyRoutes = require("./routes/studyRoutes");
const taskRoutes = require("./routes/taskRoutes");

// Database Models for Sockets logging
const Message = require("./models/Message");
// Inappropriate Words Filter Configuration
const BANNED_WORDS = ["spam", "abuse", "hate", "idiot", "jerk"]; // Add any additional words you want to censor here

function censorText(text) {
  if (!text) return "";
  let censored = text;
  BANNED_WORDS.forEach((word) => {
    // Matches the whole word case-insensitively and replaces it with asterisks
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    censored = censored.replace(regex, "*".repeat(word.length));
  });
  return censored;
}
// Initialize Express & Create HTTP Server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS enabled
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/tasks", taskRoutes);

// --- Real-time Co-Studying Rooms Sockets Engine ---
// In-Memory state keeping track of active co-studiers in each room
// Structure: { roomId: { socketId: { socketId, nickname, focus, xp, avatar, joinedAt } } }
const activeRooms = {};

io.on("connection", (socket) => {
  console.log(`Websocket client connected: ${socket.id}`);

  // 1. Join a Co-Studying Room
  socket.on("join_study_room", async ({ room, nickname, focus, xp, avatar }) => {
    // Make sure the socket leaves any previously joined study rooms to prevent double logging
    const rooms = Array.from(socket.rooms);
    rooms.forEach((r) => {
      if (r !== socket.id) {
        socket.leave(r);
        // Remove from old room records
        if (activeRooms[r] && activeRooms[r][socket.id]) {
          delete activeRooms[r][socket.id];
          // Broadcast updated list to the old room
          io.to(r).emit("room_users_list", Object.values(activeRooms[r]));
        }
      }
    });

    // Join the new socket room
    socket.join(room);

    // Initialize room container if empty
    if (!activeRooms[room]) {
      activeRooms[room] = {};
    }

    // Save active co-studier status
    activeRooms[room][socket.id] = {
      socketId: socket.id,
      nickname: nickname || "Guest Scholar",
      focus: focus || "Studying... 📚",
      xp: xp || 0,
      avatar: avatar || "violet",
      joinedAt: new Date(),
    };

    console.log(`User "${nickname}" joined co-study room: ${room}`);

    // Broadcast the updated list of students in the room to everyone inside
    io.to(room).emit("room_users_list", Object.values(activeRooms[room]));
  });

  // 2. Update Focus Status (e.g. changing status message on the fly)
  socket.on("update_focus_status", ({ room, focus }) => {
    if (activeRooms[room] && activeRooms[room][socket.id]) {
      activeRooms[room][socket.id].focus = focus;
      // Broadcast updated list
      io.to(room).emit("room_users_list", Object.values(activeRooms[room]));
    }
  });

  // 2.5. Sync Pomodoro Timer Group state across all connected clients in the study room
  socket.on("timer_sync_control", ({ room, action, minutes, seconds, isBreak, category }) => {
    socket.to(room).emit("timer_sync_event", { action, minutes, seconds, isBreak, category });
  });

  socket.on("timer_request_state", ({ room }) => {
    socket.to(room).emit("timer_need_state", { requesterId: socket.id });
  });

  socket.on("timer_provide_state", ({ room, requesterId, minutes, seconds, isActive, isBreak, category }) => {
    io.to(requesterId).emit("timer_sync_event", { action: "state_reply", minutes, seconds, isActive, isBreak, category });
  });
// Import the automatic profanity filter library
const Filter = require("bad-words");
const filter = new Filter();
  // 3. Room Chat Messages
  socket.on("send_message", async ({ roomId, username, text }) => {
    try {
      // Apply the censorship filter first
     const censoredText = filter.clean(text);

      // Save the censored message permanently to the database
      const message = await Message.create({
        roomId,
        username,
        text: censoredText,
      });
      // Broadcast the saved message with its timestamps to everyone in the room
      io.to(roomId).emit("new_message", message);
    } catch (err) {
      console.error("Error creating websocket message:", err.message);
    }
  });

  // 4. Handle Disconnecting
  socket.on("disconnect", () => {
    console.log(`Websocket client disconnected: ${socket.id}`);
    // Find what room the student was in and remove them
    for (const room in activeRooms) {
      if (activeRooms[room][socket.id]) {
        delete activeRooms[room][socket.id];
        // Broadcast the updated student list to let others know they left
        io.to(room).emit("room_users_list", Object.values(activeRooms[room]));
        break;
      }
    }
  });
});

// Server check route
app.get("/", (req, res) => {
  res.send("Studia co-studying MERN server is running smoothly! 🎓🚀");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});