const express = require("express");
const router = express.Router();
const { logStudySession, getStudyStats, getLeaderboard, updateDailyGoal } = require("../controllers/studyController");
const { protect } = require("../middlewares/authMiddleware");

// Public leaderboard
router.get("/leaderboard", getLeaderboard);

// Log study sessions (Allows both guests and logged-in users)
router.post("/log", (req, res, next) => {
  // If authorization header exists, run protection middleware, else skip to controller
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, logStudySession);

// Authenticated routes
router.get("/stats", protect, getStudyStats);
router.put("/goal", protect, updateDailyGoal);

module.exports = router;