/**
 * backend/controllers/messageController.js
 * CRUD for encrypted messages + reactions.
 */

const Message = require("../models/Message");

// ─── Get conversation history ─────────────────────────────────────────────────

exports.getMessages = async (req, res) => {
  try {
    const me      = req.user._id;
    const partner = req.query.partner_id;

    if (!partner) return res.status(400).json({ error: "partner_id required" });

    // Fetch messages in both directions, newest last
    const messages = await Message.find({
      $or: [
        { sender_id: me,      receiver_id: partner },
        { sender_id: partner, receiver_id: me      },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(200);

    res.json({ messages });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── Send a message ───────────────────────────────────────────────────────────

exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, encrypted_message, fileUrl, fileType } = req.body;

    if (!receiver_id || !encrypted_message)
      return res.status(400).json({ error: "receiver_id and encrypted_message required" });

    const message = await Message.create({
      sender_id:         req.user._id,
      receiver_id,
      encrypted_message,
      fileUrl: fileUrl || null,
      fileType: fileType || null,
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── Add / remove reaction ────────────────────────────────────────────────────

exports.toggleReaction = async (req, res) => {
  try {
    const { message_id, emoji } = req.body;
    const user_id = req.user._id;

    const msg = await Message.findById(message_id);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    const idx = msg.reactions.findIndex(
      (r) => r.emoji === emoji && r.user_id === user_id
    );

    if (idx > -1) {
      msg.reactions.splice(idx, 1);   // remove if already reacted
    } else {
      msg.reactions.push({ emoji, user_id });
    }

    await msg.save();
    res.json({ message: msg });
  } catch (err) {
    console.error("toggleReaction error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── Mark messages as read ────────────────────────────────────────────────────

exports.markRead = async (req, res) => {
  try {
    const { sender_id } = req.body;
    await Message.updateMany(
      { sender_id, receiver_id: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("markRead error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── Search messages ──────────────────────────────────────────────────────────
exports.searchMessages = async (req, res) => {
  try {
    const me = req.user._id;
    const partner = req.query.partner_id;
    const q = req.query.q;
    if (!partner || !q) return res.status(400).json({ error: "partner_id and q required" });
    // Search messages in both directions, case-insensitive
    const messages = await Message.find({
      $or: [
        { sender_id: me,      receiver_id: partner },
        { sender_id: partner, receiver_id: me      },
      ],
      encrypted_message: { $regex: q, $options: "i" },
    })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ messages });
  } catch (err) {
    console.error("searchMessages error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
