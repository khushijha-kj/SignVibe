const express = require("express");
const verifyToken = require("../middleware/auth");
const { llmHelp } = require("../controllers/llmHelpController");

const router = express.Router();

router.use(verifyToken); // Protect all routes with token verification

router.post("/", llmHelp);

module.exports = router;
