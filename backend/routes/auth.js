/**
 * backend/routes/auth.js
 */

const router = require("express").Router();
const { register, login } = require("../controllers/authController");
const { changePassword } = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middleware/validate");

router.post("/register", validateRegister, register);
router.post("/login",    validateLogin, login);
router.post("/change-password", changePassword);

module.exports = router;
