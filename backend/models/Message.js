/**
 * backend/models/Message.js
 * Mongoose schema for encrypted messages.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ReactionSchema = new mongoose.Schema(
  {
    emoji:   { type: String, required: true },
    user_id: { type: String, required: true },
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    _id:               { type: String, default: uuidv4 },
    sender_id:         { type: String, required: true, ref: "User" },
    receiver_id:       { type: String, required: true, ref: "User" },
    encrypted_message: { type: String, required: true }, // hex payload from shared/encryption.js
    read:              { type: Boolean, default: false },
    reactions:         { type: [ReactionSchema], default: [] },
    fileUrl:           { type: String, default: null },
    fileType:          { type: String, default: null },
  },
  { timestamps: true, _id: false }
);

// Index for fast conversation fetch
MessageSchema.index({ sender_id: 1, receiver_id: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);
