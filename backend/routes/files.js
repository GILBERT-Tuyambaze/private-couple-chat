/**
 * backend/routes/files.js
 * File upload and download endpoints.
 */

const router = require("express").Router();
const auth   = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile, listFiles, downloadFile } = require("../controllers/fileController");

router.use(auth);

router.post("/upload", upload.single("file"), uploadFile);
router.get("/", listFiles);
router.get("/:id/download", downloadFile);

module.exports = router;
