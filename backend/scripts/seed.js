/**
 * backend/scripts/seed.js
 * Creates 2 users and a few starter messages.
 * Run: node scripts/seed.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("../models/User");
const Message  = require("../models/Message");

const DB_URI = process.env.DB_URI || "mongodb://127.0.0.1:27017/couple_chat";

async function seed() {
  await mongoose.connect(DB_URI);
  console.log("Connected to DB");

  // Wipe existing seed data
  await User.deleteMany({});
  await Message.deleteMany({});

  const [hash1, hash2] = await Promise.all([
    bcrypt.hash("password123", 12),
    bcrypt.hash("password456", 12),
  ]);

  const [me, sophia] = await User.create([
    {
      username:      "me",
      display_name:  "You",
      password_hash: hash1,
      avatar:        "💫",
    },
    {
      username:      "sophia",
      display_name:  "Sophia",
      password_hash: hash2,
      avatar:        "🌸",
    },
  ]);

  console.log("Users created:", me._id, sophia._id);

  // Seed messages (plain text – in production the frontend encrypts)
  const msgs = [
    { sender_id: sophia._id, receiver_id: me._id, encrypted_message: "Good morning my love ☀️" },
    { sender_id: me._id,     receiver_id: sophia._id, encrypted_message: "Good morning! I was just thinking about you 💕" },
    { sender_id: sophia._id, receiver_id: me._id, encrypted_message: "What are we doing this weekend?" },
    { sender_id: me._id,     receiver_id: sophia._id, encrypted_message: "I was thinking we could go to that little café by the lake 🌊" },
    { sender_id: sophia._id, receiver_id: me._id, encrypted_message: "That sounds perfect. You always have the best ideas ✨" },
  ];

  await Message.create(msgs);
  console.log("Messages seeded ✅");

  await mongoose.disconnect();
  console.log("Done. Login with:\n  username: me       password: password123\n  username: sophia   password: password456");
}

seed().catch((e) => { console.error(e); process.exit(1); });
