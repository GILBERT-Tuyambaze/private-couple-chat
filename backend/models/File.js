/**
 * backend/models/File.js
 * Mongoose schema for uploaded files.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const FileSchema = new mongoose.Schema(
  {
    _id:         { type: String, default: uuidv4 },
    owner_id:    { type: String, required: true, ref: "User" },
    filename:    { type: String, required: true },
    mimetype:    { type: String, required: true },
    url:         { type: String, required: true }, // storage location
    uploadedAt:  { type: Date, default: Date.now },
  },
  { timestamps: true, _id: false }
);

module.exports = mongoose.model("File", FileSchema);
