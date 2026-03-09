/**
 * backend/middleware/auth.js
 * JWT authentication middleware. Attach to any protected route.
 */

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_production_please";

module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user    = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // attach user to request
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
