// backend/models/ConnectionRequest.js
const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
  from: { type: String, ref: 'User', required: true },
  to: { type: String, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
