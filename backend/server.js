// backend/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const rateLimit = require("./middleware/rateLimit");

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");
const registerSocketHandlers = require("./sockets/chat");

const app = express();
const server = http.createServer(app);

// ─── CORS config ─────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL, // e.g., https://ournest.vercel.app
].filter(Boolean);

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
console.log("Allowed origins for CORS:", ALLOWED_ORIGINS);

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit);

// ─── API Routes ───────────────────────────────
app.use("/uploads", express.static("uploads")); // static uploads
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", require("./routes/files"));
app.use("/api/connection", require("./routes/connection"));

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// ─── Socket.IO ───────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
registerSocketHandlers(io);

// ─── Database ───────────────────────────────
const DB_URI = process.env.DB_URI || "mongodb://127.0.0.1:27017/couple_chat";

mongoose.connect(DB_URI)
  .then(() => {
    console.log("✅  MongoDB connected:", DB_URI);
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌  DB connection failed:", err.message);
    process.exit(1);
  });

module.exports = { app, io };
