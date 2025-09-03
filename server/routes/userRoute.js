const express = require("express");
const router = express.Router();
const registerController = require("../controllers/registerController");
const loginController = require("../controllers/loginController");
const verifyEmail = require("../controllers/verifyEmailController");
const { requestPasswordReset, validateResetToken, resetPassword } = require("../controllers/passwordResetController");
const auth = require("../middleware/auth");
const profileController = require("../controllers/profileController");
const userController = require("../controllers/userController");
const { User } = require("../models/userModel");


// Registration and verification (public routes)
router.post("/register", registerController);
router.get("/:id/verify/:token", verifyEmail);

// Login (public route)
router.post("/login", loginController);

// Password reset (public routes)
router.post("/forgot-password", requestPasswordReset);
router.get("/reset-password/:id/:token", validateResetToken);
router.post("/reset-password/:id/:token", resetPassword);

// Profile (protected routes - add auth middleware)
router.get("/profile", auth, profileController.profileController);
router.put("/profile/update", auth, profileController.profileUpdate);

// Add this route
router.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.status(200).json({ message: "Logged out successfully" });
});

// Get all agencies (protected route)
router.get("/agencies", auth, async (req, res) => {
  try {
    const agencies = await User.find({ role: "Agency" })
      .select("firstName lastName email companyName role createdAt")
      .sort({ createdAt: -1 });
    
    res.json(agencies);
  } catch (error) {
    console.error("Error fetching agencies:", error);
    res.status(500).json({ message: "Failed to fetch agencies" });
  }
});

// User Management Routes (Admin only)
router.get("/", auth, userController.getUsers);
router.get("/stats", auth, userController.getUserStats);
router.post("/", auth, userController.createUser);
router.put("/:id", auth, userController.updateUser);
router.delete("/:id", auth, userController.deleteUser);
router.put("/:id/password", auth, userController.resetUserPassword);
router.get("/agency/:agencyId/clients", auth, userController.getAgencyClients);

module.exports = router;
