/**
 * backend/controllers/authController.js
 * Register + login with bcrypt hashing and JWT signing.
 */

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");

const JWT_SECRET  = process.env.JWT_SECRET  || "change_me_in_production_please";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ─── Register ─────────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
  try {
    const { username, password, display_name, avatar } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: "Username taken" });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      password_hash,
      display_name: display_name || username,
      avatar: avatar || "🌸",
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    await User.findByIdAndUpdate(user._id, { is_online: true, last_seen: new Date() });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── Change password ─────────────────────────────────────────────────────────
/**
 * Change password for logged-in user.
 * Expects: { current_password, new_password }
 */
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ error: "current_password and new_password required" });
    if (new_password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters." });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Current password incorrect" });

    user.password_hash = await bcrypt.hash(new_password, 12);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
