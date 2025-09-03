const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createBacklink,
  getBacklinks,
  getBacklink,
  updateBacklink,
  deleteBacklink,
  getBacklinkSummary,
  getSeoAccountBacklinks
} = require("../controllers/backlinkController");

// All routes require authentication
router.use(auth);

// Backlink routes
router.post("/", createBacklink);
router.get("/", getBacklinks);
router.get("/:id", getBacklink);
router.put("/:id", updateBacklink);
router.delete("/:id", deleteBacklink);

// Summary route
router.get("/summary/:seoAccountId", getBacklinkSummary);

// SEO Account backlinks route
router.get("/seo-account/:seoAccountId", getSeoAccountBacklinks);

module.exports = router;
