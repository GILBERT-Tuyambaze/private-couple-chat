/**
 * backend/routes/messages.js
 */

const router     = require("express").Router();
const auth       = require("../middleware/auth");
const validate   = require("../middleware/validate");
const {
  getMessages,
  sendMessage,
  toggleReaction,
  markRead,
  searchMessages,
} = require("../controllers/messageController");

router.use(auth);  // all message routes require JWT

router.get("/",          getMessages);
router.post("/send",     validate.validateMessage, sendMessage);
router.post("/reaction", toggleReaction);
router.post("/read",     markRead);
router.get("/search",   searchMessages);

module.exports = router;
