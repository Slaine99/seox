const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createSeoAccount,
  getSeoAccounts,
  getSeoAccount,
  updateSeoAccount,
  deleteSeoAccount,
  getSeoAccountsForAgency
} = require("../controllers/seoAccountController");

// All routes require authentication except GET and POST (for demo purposes)
// router.use(auth);

// SEO Account routes
router.post("/", auth, createSeoAccount); // Add auth back for creating accounts
router.get("/", auth, getSeoAccounts); // Add auth back for client access
router.get("/agency/:agencyId", auth, getSeoAccountsForAgency); // Get SEO accounts for an agency
router.get("/:id", auth, getSeoAccount);
router.put("/:id", auth, updateSeoAccount);
router.delete("/:id", auth, deleteSeoAccount);

module.exports = router;
