const express = require('express');
const { getDashboardStats, getRecentActivity, getEnhancedUserStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/protect');
const auth = require('../middleware/auth');
const router = express.Router();

// Use auth middleware for all routes (fallback to protect if auth doesn't work)
router.use((req, res, next) => {
  // Try auth first, fallback to protect
  if (auth) {
    auth(req, res, (err) => {
      if (err && protect) {
        protect(req, res, next);
      } else {
        next(err);
      }
    });
  } else if (protect) {
    protect(req, res, next);
  } else {
    next();
  }
});

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Recent activity
router.get('/activity', getRecentActivity);

// Enhanced user stats (for user management page)
router.get('/user-stats', getEnhancedUserStats);

module.exports = router;
