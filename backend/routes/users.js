/**
 * backend/routes/users.js
 */

const router = require("express").Router();
const auth   = require("../middleware/auth");
const User   = require("../models/User");

// GET /api/users/me/profile  – own profile (must be before /:id)
router.get("/me/profile", auth, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// GET /api/users/me/partner  – return real partner if set
router.get("/me/partner", auth, async (req, res) => {
  try {
    if (!req.user.partner) return res.status(404).json({ error: "No partner found yet. Send or accept a connection request first." });
    const partner = await User.findById(req.user.partner);
    if (!partner) return res.status(404).json({ error: "Partner not found." });
    res.json({ user: partner.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/users/me  – update own profile (display_name, avatar, bio)
router.patch("/me", auth, async (req, res) => {
  try {
    const allowed = ["display_name", "avatar", "bio"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// POST /api/users/disconnect – disconnect from partner
router.post("/disconnect", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.partner) return res.status(400).json({ error: "No partner to disconnect." });
    const partner = await User.findById(user.partner);
    if (partner) {
      partner.partner = null;
      partner.connectionStatus = "not_connected";
      await partner.save();
    }
    user.partner = null;
    user.connectionStatus = "not_connected";
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/:id  – public profile
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/search?q=term – search users by username or email
router.get("/search", auth, async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ users: [] });
  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { display_name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } }
    ]
  })
    .limit(10)
    .select("_id username display_name avatar");
  res.json({ users });
});

module.exports = router;
