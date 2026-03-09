/**
 * backend/models/User.js
 * Mongoose schema for users.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new mongoose.Schema(
  {
    _id:           { type: String, default: uuidv4 },
    username:      { type: String, required: true, unique: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true },
    display_name:  { type: String, default: "" },
    avatar:        { type: String, default: "🌸" },  // emoji or URL
    public_key:    { type: String, default: "" },     // future asymmetric key support
    last_seen:     { type: Date,   default: Date.now },
    is_online:     { type: Boolean, default: false },
    bio:           { type: String, default: '' },
    partner:       { type: String, ref: 'User', default: null },
    connectionStatus: { type: String, enum: ['not_connected', 'pending', 'connected'], default: 'not_connected' },
  },
  { timestamps: true, _id: false }
);

// Never return the password hash in JSON responses
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
// NOTE: bio field added for profile editing
