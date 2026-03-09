/**
 * backend/sockets/chat.js
 * All real-time Socket.IO event handlers.
 *
 * Events emitted to clients:
 *   newMessage   – { message }
 *   typing       – { from_user_id, is_typing }
 *   messageRead  – { message_ids, by_user_id }
 *   userStatus   – { user_id, is_online }
 */

const jwt     = require("jsonwebtoken");
const User    = require("../models/User");
const Message = require("../models/Message");

const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_production_please";

// Map: user_id → socket.id
const onlineUsers = new Map();

module.exports = function registerSocketHandlers(io) {
  // ── Auth middleware for Socket.IO ──────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error"));
      const payload = jwt.verify(token, JWT_SECRET);
      const user    = await User.findById(payload.id);
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id;
    onlineUsers.set(userId, socket.id);

    // Mark user online in DB
    await User.findByIdAndUpdate(userId, { is_online: true, last_seen: new Date() });

    // Notify partner
    io.emit("userStatus", { user_id: userId, is_online: true });
    console.log(`🔌  ${socket.user.username} connected (${socket.id})`);

    // ── Send message ──────────────────────────────────────────────────────────
    socket.on("sendMessage", async (data) => {
      try {
        // data: { receiver_id, encrypted_message, fileUrl, fileType }
        const message = await Message.create({
          sender_id:         userId,
          receiver_id:       data.receiver_id,
          encrypted_message: data.encrypted_message,
          fileUrl:           data.fileUrl || null,
          fileType:          data.fileType || null,
        });

        const payload = { message };

        // Deliver to sender (confirmation)
        socket.emit("newMessage", payload);

        // Deliver to recipient if online
        const recipientSocketId = onlineUsers.get(data.receiver_id);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("newMessage", payload);
        }
      } catch (err) {
        console.error("sendMessage socket error:", err);
        socket.emit("error", { msg: "Failed to send message" });
      }
    });

    // ── Typing indicator ──────────────────────────────────────────────────────
    socket.on("typing", (data) => {
      // data: { receiver_id, is_typing }
      const recipientSocketId = onlineUsers.get(data.receiver_id);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("typing", {
          from_user_id: userId,
          is_typing:    data.is_typing,
        });
      }
    });

    // ── Read receipts ─────────────────────────────────────────────────────────
    socket.on("markRead", async (data) => {
      // data: { sender_id }  – we've read all messages from this sender
      await Message.updateMany(
        { sender_id: data.sender_id, receiver_id: userId, read: false },
        { $set: { read: true } }
      );
      const senderSocketId = onlineUsers.get(data.sender_id);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageRead", { by_user_id: userId });
      }
    });

    // ── Reaction toggle ───────────────────────────────────────────────────────
    socket.on("toggleReaction", async (data) => {
      // data: { message_id, emoji }
      try {
        const msg = await Message.findById(data.message_id);
        if (!msg) return;

        const idx = msg.reactions.findIndex(
          (r) => r.emoji === data.emoji && r.user_id === userId
        );
        if (idx > -1) {
          msg.reactions.splice(idx, 1);
        } else {
          msg.reactions.push({ emoji: data.emoji, user_id: userId });
        }
        await msg.save();

        // Broadcast to both users
        const ids = [msg.sender_id, msg.receiver_id];
        ids.forEach((id) => {
          const sid = onlineUsers.get(id);
          if (sid) io.to(sid).emit("reactionUpdate", { message: msg });
        });
      } catch (err) {
        console.error("toggleReaction socket error:", err);
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { is_online: false, last_seen: new Date() });
      io.emit("userStatus", { user_id: userId, is_online: false });
      console.log(`🔌  ${socket.user.username} disconnected`);
    });
  });
};
