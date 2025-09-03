const express = require("express");
const router = express.Router();
const {
  verifyClientInvitation,
  registerClientWithInvitation
} = require("../controllers/clientRegisterController");

// Verify client invitation token
router.get("/verify/:token", verifyClientInvitation);

// Register client with invitation token
router.post("/register/:token", registerClientWithInvitation);

module.exports = router;
