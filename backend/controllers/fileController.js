/**
 * backend/controllers/fileController.js
 * Handles file upload and download endpoints.
 */

const File = require("../models/File");
const path = require("path");
const fs   = require("fs");

// Upload file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { originalname, mimetype, filename } = req.file;
    const url = `/uploads/${filename}`;
    const file = await File.create({
      owner_id: req.user._id,
      filename: originalname,
      mimetype,
      url,
    });
    res.status(201).json({ file });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
};

// List files for user
exports.listFiles = async (req, res) => {
  try {
    const files = await File.find({ owner_id: req.user._id }).sort({ uploadedAt: -1 });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: "Failed to list files" });
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });
    const filePath = path.join(__dirname, "../uploads", path.basename(file.url));
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File missing" });
    res.download(filePath, file.filename);
  } catch (err) {
    res.status(500).json({ error: "Download failed" });
  }
};
