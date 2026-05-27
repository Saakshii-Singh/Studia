const StudySession = require("../models/StudySession");
const User = require("../models/User");

// Helper to check if two dates are the same calendar day
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Helper to check if d2 is yesterday relative to d1
function isYesterday(d1, d2) {
  const yesterday = new Date(d1);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(yesterday, d2);
}

exports.logStudySession = async (req, res) => {
  const { duration, category, roomName, nickname } = req.body;

  try {
    if (!duration || duration <= 0) {
      return res.status(400).json({ message: "Valid duration is required" });
    }

    let sessionData = {
      duration,
      category: category || "General",
      roomName: roomName || "Silent Study Room",
    };

    let userStats = null;

    if (req.user) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      sessionData.userId = user._id;
      sessionData.nickname = user.username;

      // Update total study time
      user.totalStudyTime = (user.totalStudyTime || 0) + Number(duration);

      // Level and XP system (10 XP per minute studied)
      const xpGained = Number(duration) * 10;
      user.xp = (user.xp || 0) + xpGained;

      // level formula: floor(sqrt(XP / 100)) + 1
      const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
      const leveledUp = newLevel > (user.level || 1);
      user.level = newLevel;

      // Streak logic
      const now = new Date();
      if (user.lastStudyDate) {
        const lastDate = new Date(user.lastStudyDate);
        if (isSameDay(now, lastDate)) {
          // Already studied today, streak stays active
        } else if (isYesterday(now, lastDate)) {
          user.studyStreak = (user.studyStreak || 0) + 1;
        } else {
          user.studyStreak = 1;
        }
      } else {
        user.studyStreak = 1;
      }
      user.lastStudyDate = now;

      await user.save();

      userStats = {
        totalStudyTime: user.totalStudyTime,
        xp: user.xp,
        level: user.level,
        studyStreak: user.studyStreak,
        leveledUp,
      };
    } else {
      sessionData.nickname = nickname || "Guest Scholar";
    }

    const session = await StudySession.create(sessionData);

    res.status(201).json({
      session,
      userStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await StudySession.find({ userId }).sort({ createdAt: -1 });

    // Group study time by day for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push({
        dateStr: d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
        dateObj: d,
        minutes: 0,
      });
    }

    sessions.forEach(sess => {
      const sessDate = new Date(sess.createdAt);
      last7Days.forEach(day => {
        if (isSameDay(sessDate, day.dateObj)) {
          day.minutes += sess.duration;
        }
      });
    });

    const weeklyData = last7Days.map(day => ({
      name: day.dateStr,
      hours: parseFloat((day.minutes / 60).toFixed(2)),
    }));

    // Group focus time by category
    const categoryMap = {};
    sessions.forEach(sess => {
      const cat = sess.category || "General";
      categoryMap[cat] = (categoryMap[cat] || 0) + sess.duration;
    });

    const categoryData = Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key],
    }));

    const totalMinutes = sessions.reduce((acc, curr) => acc + curr.duration, 0);
    const totalHours = parseFloat((totalMinutes / 60).toFixed(1));

    res.json({
      sessions: sessions.slice(0, 10),
      totalHours,
      totalSessions: sessions.length,
      weeklyData,
      categoryData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find()
      .select("username xp studyStreak totalStudyTime")
      .sort({ xp: -1 })
      .limit(10);

    const leaderboard = topUsers.map((user, idx) => ({
      rank: idx + 1,
      username: user.username,
      level: Math.floor(Math.sqrt(user.xp / 100)) + 1,
      streak: user.studyStreak || 0,
      hours: parseFloat(((user.totalStudyTime || 0) / 60).toFixed(1)),
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDailyGoal = async (req, res) => {
  const { goal } = req.body;

  try {
    if (!goal || goal <= 0) {
      return res.status(400).json({ message: "Please provide a valid study goal in minutes" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.dailyStudyGoal = Number(goal);
    await user.save();

    res.json({
      message: "Daily goal updated successfully",
      dailyStudyGoal: user.dailyStudyGoal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};